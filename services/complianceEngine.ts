/**
 * DocuSync Compliance Engine
 * 
 * Validates Capstone manuscripts against DCT CCS Capstone Manual requirements.
 * Uses guidelines.ts as the single source of truth for all requirements.
 */

import JSZip from 'jszip';
import mammoth from 'mammoth';
import * as _pdfjsLib from 'pdfjs-dist';
import { analyzeTextForCompliance, validateCitations } from './geminiService';
import { AuditIssue, ComplianceMetadata, SectionStatus, IssueType, IssueSeverity } from '../types';
import {
  MARGIN_SPECS,
  MARGIN_SPECS_TWIPS,
  SPACING_SPECS,
  FONT_SPECS,
  ABSTRACT_SPECS,
  CITATION_FORMAT,
  TABLE_FORMAT,
  FIGURE_FORMAT,
  UNACCEPTABLE_PROJECT_PATTERNS,
  BANNED_WORDS,
  SAFE_REPLACEMENTS,
  TOLERANCES,
  SCORING,
  TWIPS_PER_INCH,
  ALL_SECTIONS,
  PRELIMINARY_PAGES,
  MAIN_CHAPTERS,
  END_MATTER,
  SectionDefinition,
} from '../guidelines';

// PDF.js import handling for CDN environments (esm.sh often wraps in default)
const pdfjsLib: any = (_pdfjsLib as any).default || _pdfjsLib;

// Configure PDF.js worker
if (pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
} else {
  console.warn("PDF.js GlobalWorkerOptions is missing. PDF parsing may fail.");
}

// ============================================================================
// TYPES
// ============================================================================

interface DocMetadata {
  margins: { top: number; right: number; bottom: number; left: number } | null;
  fonts: Set<string>;
  fontSizes: Set<number>;
  lineSpacings: Set<number>;
  alignments: Set<string>;
  rawText: string;
  sourceType: 'DOCX' | 'PDF';
  pageCount: number;
}

const POINTS_PER_INCH = 72; // PDF uses points

// ============================================================================
// DOCUMENT PARSING
// ============================================================================

const parseDocx = async (file: File): Promise<DocMetadata> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // 1. Get Text via Mammoth
  let rawText = "";
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    rawText = result.value;
  } catch (e) {
    console.error("Mammoth text extraction failed", e);
  }

  // 2. Get XML via JSZip for Formatting Check
  const zip = new JSZip();
  await zip.loadAsync(arrayBuffer);
  
  const docXml = await zip.file("word/document.xml")?.async("string");
  if (!docXml) throw new Error("Invalid DOCX file: word/document.xml not found");

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, "text/xml");

  // 3. Parse Margins (w:pgMar)
  const pgMars = xmlDoc.getElementsByTagName("w:pgMar");
  let margins = null;
  
  if (pgMars.length > 0) {
    const lastMar = pgMars[pgMars.length - 1];
    margins = {
      top: parseInt(lastMar.getAttribute("w:top") || "0", 10),
      right: parseInt(lastMar.getAttribute("w:right") || "0", 10),
      bottom: parseInt(lastMar.getAttribute("w:bottom") || "0", 10),
      left: parseInt(lastMar.getAttribute("w:left") || "0", 10),
    };
  }

  // 4. Parse Fonts and Sizes
  const fonts = new Set<string>();
  const fontSizes = new Set<number>();
  
  const rFonts = xmlDoc.getElementsByTagName("w:rFonts");
  const maxSamples = 100; // Limit sampling for performance
  
  for (let i = 0; i < Math.min(rFonts.length, maxSamples); i++) {
    const ascii = rFonts[i].getAttribute("w:ascii");
    if (ascii) fonts.add(ascii);
    const hAnsi = rFonts[i].getAttribute("w:hAnsi");
    if (hAnsi) fonts.add(hAnsi);
  }

  const szs = xmlDoc.getElementsByTagName("w:sz");
  for (let i = 0; i < Math.min(szs.length, maxSamples); i++) {
    const val = szs[i].getAttribute("w:val");
    if (val) fontSizes.add(parseInt(val, 10)); // val is in half-points (1/144 inch)
  }

  // 5. Parse Paragraph Properties (Spacing & Alignment)
  const lineSpacings = new Set<number>();
  const alignments = new Set<string>();
  const pPrs = xmlDoc.getElementsByTagName("w:pPr");
  
  for (let i = 0; i < Math.min(pPrs.length, 50); i++) {
    const pPr = pPrs[i];
    
    // Spacing: Look for <w:spacing w:line="..." />
    // 240 = Single, 360 = 1.5, 480 = Double
    const spacing = pPr.getElementsByTagName("w:spacing")[0];
    if (spacing) {
      const line = spacing.getAttribute("w:line");
      if (line) lineSpacings.add(parseInt(line, 10));
    }

    // Alignment: Look for <w:jc w:val="..." />
    const jc = pPr.getElementsByTagName("w:jc")[0];
    if (jc) {
      const val = jc.getAttribute("w:val");
      if (val) alignments.add(val);
    } else {
      alignments.add("left"); // Implicit left
    }
  }

  // 6. Parse Page Count from docProps/app.xml
  let pageCount = 0;
  try {
    const appXml = await zip.file("docProps/app.xml")?.async("string");
    if (appXml) {
      const appParser = new DOMParser();
      const appDoc = appParser.parseFromString(appXml, "text/xml");
      let pagesNode = appDoc.getElementsByTagName("Pages")[0];
      
      if (!pagesNode) {
        const allTags = appDoc.getElementsByTagName("*");
        for (let i = 0; i < allTags.length; i++) {
          if (allTags[i].localName === "Pages") {
            pagesNode = allTags[i];
            break;
          }
        }
      }
      
      if (pagesNode && pagesNode.textContent) {
        pageCount = parseInt(pagesNode.textContent, 10);
      }
    }
  } catch (e) {
    console.warn("Failed to parse app.xml for page count", e);
  }

  // Fallback if metadata is 0 or missing
  if (!pageCount) {
    pageCount = Math.max(1, Math.ceil(rawText.length / 1800));
  }

  return { margins, fonts, fontSizes, lineSpacings, alignments, rawText, sourceType: 'DOCX', pageCount };
};

const parsePdf = async (file: File): Promise<DocMetadata> => {
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument({ 
    data: arrayBuffer,
    disableFontFace: true 
  });
  
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  const fonts = new Set<string>();
  const fontSizes = new Set<number>();
  
  let minLeft = Infinity;
  let maxRight = 0; 
  let minBottom = Infinity;
  let maxTop = 0;
  let pageWidth = 0;
  let pageHeight = 0;

  const numPagesToScan = Math.min(pdf.numPages, 3); 

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });
    
    if (i <= numPagesToScan) {
      pageWidth = viewport.width;
      pageHeight = viewport.height;
    }

    let lastY = -1;
    for (const item of textContent.items as any[]) {
      const currentY = item.transform[5];
      if (lastY !== -1 && Math.abs(currentY - lastY) > 10) {
        fullText += '\n';
      } else {
        fullText += ' ';
      }
      fullText += item.str;
      lastY = currentY;
      
      if (i <= numPagesToScan && item.str.trim().length > 0) {
        const tx = item.transform[4];
        const ty = item.transform[5];
        const itemHeight = Math.abs(item.transform[3]); 
        const itemWidth = item.width || 0;

        if (tx < minLeft) minLeft = tx;
        if (tx + itemWidth > maxRight) maxRight = tx + itemWidth;
        if (ty > maxTop) maxTop = ty; 
        if (ty < minBottom) minBottom = ty;
        
        fontSizes.add(Math.round(itemHeight));
        
        if (item.fontName && textContent.styles[item.fontName]) {
          const fontData = textContent.styles[item.fontName];
          if (fontData.fontFamily) fonts.add(fontData.fontFamily);
        }
      }
    }
    fullText += '\n';
  }

  if (minLeft === Infinity) minLeft = 0;
  if (maxRight === 0) maxRight = pageWidth;
  
  const margins = {
    left: minLeft,
    right: pageWidth - maxRight,
    top: pageHeight - maxTop, 
    bottom: minBottom
  };

  return { margins, fonts, fontSizes, lineSpacings: new Set(), alignments: new Set(), rawText: fullText, sourceType: 'PDF', pageCount: pdf.numPages };
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

const validateMargins = (metadata: DocMetadata): AuditIssue[] => {
  const issues: AuditIssue[] = [];
  
  if (!metadata.margins) return issues;
  
  const { top, bottom, left, right } = metadata.margins;
  
  if (metadata.sourceType === 'DOCX') {
    // Check Left Margin (1.5")
    if (Math.abs(left - MARGIN_SPECS_TWIPS.left) > TOLERANCES.marginTwips) {
      issues.push({
        id: 'margin-left',
        type: 'MARGIN',
        description: `Left margin is ${(left / TWIPS_PER_INCH).toFixed(2)}". Required: ${MARGIN_SPECS.left}".`,
        suggestion: `Adjust Page Setup > Margins > Left to ${MARGIN_SPECS.left} inches.`,
        context: "Document Page Layout Settings",
        severity: 'HIGH'
      });
    }
    
    // Check Right Margin (1.0")
    if (Math.abs(right - MARGIN_SPECS_TWIPS.right) > TOLERANCES.marginTwips) {
      issues.push({
        id: 'margin-right',
        type: 'MARGIN',
        description: `Right margin is ${(right / TWIPS_PER_INCH).toFixed(2)}". Required: ${MARGIN_SPECS.right}".`,
        suggestion: `Adjust Page Setup > Margins > Right to ${MARGIN_SPECS.right} inch.`,
        context: "Document Page Layout Settings",
        severity: 'MEDIUM'
      });
    }
    
    // Check Top Margin (1.0")
    if (Math.abs(top - MARGIN_SPECS_TWIPS.top) > TOLERANCES.marginTwips) {
      issues.push({
        id: 'margin-top',
        type: 'MARGIN',
        description: `Top margin is ${(top / TWIPS_PER_INCH).toFixed(2)}". Required: ${MARGIN_SPECS.top}".`,
        suggestion: `Adjust Page Setup > Margins > Top to ${MARGIN_SPECS.top} inch.`,
        context: "Document Page Layout Settings",
        severity: 'MEDIUM'
      });
    }
    
    // Check Bottom Margin (1.0")
    if (Math.abs(bottom - MARGIN_SPECS_TWIPS.bottom) > TOLERANCES.marginTwips) {
      issues.push({
        id: 'margin-bottom',
        type: 'MARGIN',
        description: `Bottom margin is ${(bottom / TWIPS_PER_INCH).toFixed(2)}". Required: ${MARGIN_SPECS.bottom}".`,
        suggestion: `Adjust Page Setup > Margins > Bottom to ${MARGIN_SPECS.bottom} inch.`,
        context: "Document Page Layout Settings",
        severity: 'LOW'
      });
    }
  } else if (metadata.sourceType === 'PDF') {
    // PDF margin checks (using points)
    const leftInches = left / POINTS_PER_INCH;
    if (leftInches < MARGIN_SPECS.left - (TOLERANCES.marginPoints / POINTS_PER_INCH)) {
      issues.push({
        id: 'pdf-margin-left',
        type: 'MARGIN',
        description: `Left text boundary at ${leftInches.toFixed(2)}". Content may violate ${MARGIN_SPECS.left}" margin.`,
        suggestion: `Ensure content does not protrude into the ${MARGIN_SPECS.left}" left margin.`,
        context: "Document Page Layout (PDF Scan)",
        severity: 'HIGH'
      });
    }
    
    const rightInches = right / POINTS_PER_INCH;
    if (rightInches < MARGIN_SPECS.right - (TOLERANCES.marginPoints / POINTS_PER_INCH)) {
      issues.push({
        id: 'pdf-margin-right',
        type: 'MARGIN',
        description: `Right text boundary at ${rightInches.toFixed(2)}" from edge. Content may violate ${MARGIN_SPECS.right}" margin.`,
        suggestion: `Ensure content does not protrude into the ${MARGIN_SPECS.right}" right margin.`,
        context: "Document Page Layout (PDF Scan)",
        severity: 'MEDIUM'
      });
    }
  }
  
  return issues;
};

const validateFonts = (metadata: DocMetadata): AuditIssue[] => {
  const issues: AuditIssue[] = [];
  
  const foundFonts = Array.from(metadata.fonts);
  const requiredFont = FONT_SPECS.family.toLowerCase();
  const invalidFonts = foundFonts.filter(f => 
    !f.toLowerCase().includes('times new roman') && 
    !f.toLowerCase().includes('times')
  );
  
  if (invalidFonts.length > 0 && metadata.sourceType === 'DOCX') {
    issues.push({
      id: 'font-family',
      type: 'FONT',
      description: `Non-compliant fonts detected: ${invalidFonts.join(', ')}.`,
      suggestion: `Ensure the entire document uses ${FONT_SPECS.family}.`,
      context: `Detected fonts: ${invalidFonts.join(', ')}`,
      severity: 'HIGH'
    });
  }
  
  return issues;
};

const validateFontSizes = (metadata: DocMetadata): AuditIssue[] => {
  const issues: AuditIssue[] = [];
  
  // Content should be 11pt (half-points = 22), Headings 1 & 2 should be 12pt (half-points = 24)
  const validSizesHalfPoints = [22, 24, 28]; // 11pt, 12pt, 14pt (for table/figure titles)
  
  const invalidSizes = Array.from(metadata.fontSizes).filter(sizeVal => {
    if (metadata.sourceType === 'DOCX') {
      // Size is in half-points
      return !validSizesHalfPoints.some(valid => Math.abs(sizeVal - valid) <= 2);
    } else {
      // PDF: size is roughly in points
      const validSizesPt = [11, 12, 14];
      return !validSizesPt.some(valid => Math.abs(sizeVal - valid) <= TOLERANCES.fontSizePoints);
    }
  });

  if (invalidSizes.length > 0) {
    const invalidSizesStr = invalidSizes
      .map(s => metadata.sourceType === 'DOCX' ? s / 2 : s)
      .sort((a, b) => a - b)
      .join('pt, ') + 'pt';
    issues.push({
      id: 'font-size',
      type: 'FONT',
      description: `Non-compliant font sizes detected: ${invalidSizesStr}.`,
      suggestion: `Ensure body text is ${FONT_SPECS.sizes.content}pt, headings are ${FONT_SPECS.sizes.heading1}pt.`,
      context: `Detected sizes: ${invalidSizesStr}`,
      severity: 'HIGH'
    });
  }
  
  return issues;
};

const validateLineSpacing = (metadata: DocMetadata): AuditIssue[] => {
  const issues: AuditIssue[] = [];
  
  if (metadata.sourceType !== 'DOCX' || metadata.lineSpacings.size === 0) return issues;
  
  // 360 = 1.5 spacing per DCT guidelines (Section 10.3.B)
  const requiredSpacing = SPACING_SPECS.lineSpacingTwips;
  const hasInvalidSpacing = Array.from(metadata.lineSpacings).some(
    val => Math.abs(val - requiredSpacing) > TOLERANCES.spacingTwips && val !== 240 // 240 = single for headings
  );
  
  if (hasInvalidSpacing) {
    issues.push({
      id: 'line-spacing',
      type: 'SPACING',
      description: `Non-standard line spacing detected. DCT requires ${SPACING_SPECS.lineSpacing} line spacing.`,
      suggestion: `Set Line Spacing to "${SPACING_SPECS.lineSpacing}" (1.5) for body text.`,
      context: 'Formatting Scan',
      severity: 'MEDIUM'
    });
  }
  
  return issues;
};

const validateAlignment = (metadata: DocMetadata): AuditIssue[] => {
  const issues: AuditIssue[] = [];
  
  if (metadata.sourceType !== 'DOCX' || metadata.alignments.size === 0) return issues;
  
  const alignments = Array.from(metadata.alignments);
  const hasNonJustified = alignments.some(val => val === 'left' || val === 'right');
  
  // Check if justified alignment is missing entirely
  const hasJustified = alignments.some(val => val === 'both' || val === 'justify');
  
  if (hasNonJustified && !hasJustified) {
    issues.push({
      id: 'text-alignment',
      type: 'ALIGNMENT',
      description: 'Body text should be Justified. Left/Right aligned text detected.',
      suggestion: 'Ensure all body paragraphs are Justified.',
      context: 'Formatting Scan',
      severity: 'LOW'
    });
  }
  
  return issues;
};

const validateStructure = (text: string): { issues: AuditIssue[], sections: SectionStatus[] } => {
  const issues: AuditIssue[] = [];
  const sectionStatus: SectionStatus[] = [];
  let lastIndex = -1;

  // Check all sections from guidelines
  for (const section of ALL_SECTIONS) {
    const match = section.regex.exec(text);
    const found = !!match;
    
    sectionStatus.push({
      key: section.key,
      name: section.displayName,
      found,
      required: section.required,
      pageNumberStyle: section.pageNumberStyle,
    });

    if (match) {
      if (match.index < lastIndex) {
        issues.push({
          id: `struct-order-${section.key}`,
          type: 'STRUCTURE',
          description: `Section '${section.displayName}' appears out of order.`,
          suggestion: 'Ensure sections follow the prescribed sequence in DCT CCS Capstone Manual.',
          context: `Found "${section.displayName}" at unexpected position.`,
          severity: 'HIGH'
        });
      }
      lastIndex = match.index;
    } else if (section.required) {
      issues.push({
        id: `struct-missing-${section.key}`,
        type: 'STRUCTURE',
        description: `Missing mandatory section: '${section.displayName}'.`,
        suggestion: section.description || 'Add this required section to your manuscript.',
        context: "Document structure scan",
        severity: 'HIGH'
      });
    }
  }

  return { issues, sections: sectionStatus };
};

const extractAbstract = (text: string): string | null => {
  const stopHeaders = [
    "TABLE OF CONTENTS",
    "ACKNOWLEDGEMENT",
    "DEDICATION",
    "LIST OF TABLES",
    "LIST OF FIGURES",
    "CHAPTER",
    "INTRODUCTION",
    "1\\.0",
    "APPROVAL"
  ];
  
  const pattern = new RegExp(`ABSTRACT([\\s\\S]*?)(?:${stopHeaders.join('|')})`, 'i');
  const match = text.match(pattern);
  
  if (match) {
    return match[1].trim();
  }
  
  const simpleMatch = text.match(/ABSTRACT([\s\S]{100,2000})/i);
  return simpleMatch ? simpleMatch[1].trim() : null;
};

const validateAbstract = (text: string): { issues: AuditIssue[], wordCount: number } => {
  const issues: AuditIssue[] = [];
  const abstractText = extractAbstract(text);
  let wordCount = 0;
  
  if (!abstractText) {
    return { issues, wordCount };
  }
  
  wordCount = abstractText.split(/\s+/).filter(w => w.length > 0).length;
  
  // Check word count (150-200 per DCT guidelines)
  if (wordCount < ABSTRACT_SPECS.minWords) {
    issues.push({
      id: 'abstract-too-short',
      type: 'ABSTRACT',
      description: `Abstract is too short: ${wordCount} words. Minimum: ${ABSTRACT_SPECS.minWords} words.`,
      suggestion: 'Expand your abstract to provide complete summary of rationale and objectives.',
      context: `Current length: ${wordCount} words`,
      severity: 'MEDIUM'
    });
  } else if (wordCount > ABSTRACT_SPECS.maxWords) {
    issues.push({
      id: 'abstract-too-long',
      type: 'ABSTRACT',
      description: `Abstract exceeds maximum: ${wordCount} words. Maximum: ${ABSTRACT_SPECS.maxWords} words.`,
      suggestion: 'Condense your abstract to be more concise.',
      context: `Current length: ${wordCount} words`,
      severity: 'MEDIUM'
    });
  }
  
  // Check for banned phrases at start
  for (const pattern of ABSTRACT_SPECS.bannedPhrases) {
    if (pattern.test(abstractText)) {
      issues.push({
        id: 'abstract-banned-start',
        type: 'ABSTRACT',
        description: 'Abstract should not begin with "This paper/document/project/study..."',
        suggestion: 'Start with a more direct statement about what the project does or achieves.',
        context: abstractText.substring(0, 50) + '...',
        severity: 'MEDIUM'
      });
      break;
    }
  }
  
  return { issues, wordCount };
};

const extractReferences = (text: string): string | null => {
  const match = text.match(/(?:REFERENCES|BIBLIOGRAPHY)([\s\S]*?)(?:APPENDIX|APPENDICES|CURRICULUM VITAE|CV|RESOURCE\s+PERSONS?|$)/i);
  return match ? match[1].trim() : null;
};

const validateTableFigureCaptions = (text: string): { issues: AuditIssue[], tableCount: number, figureCount: number } => {
  const issues: AuditIssue[] = [];
  
  // Find tables
  const tableMatches = text.match(/Table\s+\d+/gi) || [];
  const figureMatches = text.match(/Figure\s+\d+/gi) || [];
  
  // Check for proper format (Table X-Y format)
  const properTableFormat = text.match(TABLE_FORMAT.pattern);
  const properFigureFormat = text.match(FIGURE_FORMAT.pattern);
  
  if (tableMatches.length > 0 && !properTableFormat) {
    issues.push({
      id: 'table-format',
      type: 'TABLE_FIGURE',
      description: 'Table captions may not follow DCT format.',
      suggestion: `Use format: "${TABLE_FORMAT.example}"`,
      context: 'Tables detected but format not verified',
      severity: 'LOW'
    });
  }
  
  if (figureMatches.length > 0 && !properFigureFormat) {
    issues.push({
      id: 'figure-format',
      type: 'TABLE_FIGURE',
      description: 'Figure captions may not follow DCT format.',
      suggestion: `Use format: "${FIGURE_FORMAT.example}"`,
      context: 'Figures detected but format not verified',
      severity: 'LOW'
    });
  }
  
  return { 
    issues, 
    tableCount: tableMatches.length, 
    figureCount: figureMatches.length 
  };
};

const checkUnacceptableProjectType = (text: string): AuditIssue[] => {
  const issues: AuditIssue[] = [];
  
  for (const pattern of UNACCEPTABLE_PROJECT_PATTERNS) {
    if (pattern.test(text)) {
      issues.push({
        id: 'unacceptable-project',
        type: 'PROJECT_TYPE',
        description: 'Document may describe an unacceptable project type per DCT guidelines.',
        suggestion: 'Review Section 11.0 of DCT CCS Capstone Manual for acceptable project types.',
        context: 'Detected pattern suggesting unacceptable project',
        severity: 'HIGH'
      });
      break; // Only report once
    }
  }
  
  return issues;
};

const findBannedWords = (text: string): { issues: AuditIssue[], bannedWordsFound: string[] } => {
  const issues: AuditIssue[] = [];
  const bannedWordsFound: string[] = [];
  const textLower = text.toLowerCase();
  
  for (const word of BANNED_WORDS) {
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (pattern.test(textLower)) {
      bannedWordsFound.push(word);
    }
  }
  
  // Group into single issue if found
  if (bannedWordsFound.length > 0) {
    const replacements = bannedWordsFound
      .slice(0, 5) // Show max 5
      .map(w => {
        const safe = SAFE_REPLACEMENTS[w.toLowerCase()];
        return safe ? `"${w}" → ${safe.join(' / ')}` : `"${w}"`;
      })
      .join('; ');
    
    issues.push({
      id: 'banned-words',
      type: 'BANNED_WORD',
      description: `Found ${bannedWordsFound.length} banned/informal word(s) in document.`,
      suggestion: `Replace with academic alternatives. Examples: ${replacements}`,
      context: `Words found: ${bannedWordsFound.slice(0, 10).join(', ')}${bannedWordsFound.length > 10 ? '...' : ''}`,
      severity: bannedWordsFound.length > 5 ? 'MEDIUM' : 'LOW'
    });
  }
  
  return { issues, bannedWordsFound };
};

// ============================================================================
// SCORING
// ============================================================================

const calculateScore = (issues: AuditIssue[]): number => {
  const { penalties } = SCORING;
  
  const structureIssues = issues.filter(i => i.type === 'STRUCTURE');
  const marginIssues = issues.filter(i => i.type === 'MARGIN');
  const fontIssues = issues.filter(i => i.type === 'FONT');
  const spacingIssues = issues.filter(i => i.type === 'SPACING');
  const alignmentIssues = issues.filter(i => i.type === 'ALIGNMENT');
  const linguisticIssues = issues.filter(i => ['GRAMMAR', 'TONE', 'BANNED_WORD'].includes(i.type));
  const citationIssues = issues.filter(i => i.type === 'CITATION_STYLE');
  const abstractIssues = issues.filter(i => i.type === 'ABSTRACT');
  
  // Helper to get penalty value based on severity
  const getPenalty = (issue: AuditIssue, category: { high: number; medium: number; low: number }) => {
    return issue.severity === 'HIGH' ? category.high : 
           issue.severity === 'MEDIUM' ? category.medium : category.low;
  };
  
  // Structure penalties
  const structurePenalty = structureIssues.reduce((acc, i) => acc + getPenalty(i, penalties.structure), 0);
  
  // Formatting penalties (margins + fonts + spacing + alignment)
  const formattingIssues = [...marginIssues, ...fontIssues, ...spacingIssues, ...alignmentIssues];
  const formattingPenalty = formattingIssues.reduce((acc, i) => acc + getPenalty(i, penalties.formatting), 0);
  
  // Linguistic penalties (capped)
  const linguisticRawPenalty = linguisticIssues.reduce((acc, i) => acc + getPenalty(i, penalties.linguistic), 0);
  const linguisticPenalty = Math.min(linguisticRawPenalty, penalties.linguistic.maxPenalty);
  
  // Citation penalties (capped)
  const citationRawPenalty = citationIssues.reduce((acc, i) => acc + getPenalty(i, penalties.citation), 0);
  const citationPenalty = Math.min(citationRawPenalty, penalties.citation.maxPenalty);
  
  // Abstract penalties
  const abstractPenalty = abstractIssues.reduce((acc, i) => 
    acc + (i.severity === 'HIGH' ? 5 : i.severity === 'MEDIUM' ? 3 : 1), 0);
  
  const totalPenalty = structurePenalty + formattingPenalty + linguisticPenalty + citationPenalty + abstractPenalty;
  
  return Math.max(0, SCORING.maxScore - totalPenalty);
};

// ============================================================================
// MAIN EXPORT
// ============================================================================

export const runFullComplianceCheck = async (file: File): Promise<{ score: number, issues: AuditIssue[], metadata: ComplianceMetadata }> => {
  const issues: AuditIssue[] = [];
  let metadata: DocMetadata;

  try {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      metadata = await parsePdf(file);
    } else {
      metadata = await parseDocx(file);
    }
  } catch (e) {
    console.error(e);
    return {
      score: 0,
      issues: [{
        id: 'sys-error',
        type: 'STRUCTURE',
        description: 'Failed to parse document. Please ensure it is a valid .docx or .pdf file.',
        severity: 'HIGH'
      }],
      metadata: { 
        pageCountEstimate: 0, 
        abstractWordCount: 0, 
        sections: [], 
        citationCountEstimate: 0 
      }
    };
  }

  // 1. Formatting Validations
  issues.push(...validateMargins(metadata));
  issues.push(...validateFonts(metadata));
  issues.push(...validateFontSizes(metadata));
  issues.push(...validateLineSpacing(metadata));
  issues.push(...validateAlignment(metadata));

  // 2. Structural Validation
  const structuralCheck = validateStructure(metadata.rawText);
  issues.push(...structuralCheck.issues);

  // 3. Abstract Validation
  const abstractCheck = validateAbstract(metadata.rawText);
  issues.push(...abstractCheck.issues);

  // 4. Table/Figure Format Check
  const tableFigureCheck = validateTableFigureCaptions(metadata.rawText);
  issues.push(...tableFigureCheck.issues);

  // 5. Unacceptable Project Type Check
  issues.push(...checkUnacceptableProjectType(metadata.rawText));

  // 6. Banned Words Check (local)
  const bannedWordsCheck = findBannedWords(metadata.rawText);
  issues.push(...bannedWordsCheck.issues);

  // 7. AI-Powered Linguistic Analysis
  let citationCountEstimate = 0;
  if (metadata.rawText.length > 50) {
    try {
      const textSample = metadata.rawText.substring(0, 50000);
      const geminiResult = await analyzeTextForCompliance(textSample);
      
      if (geminiResult.issues) {
        geminiResult.issues.forEach((issue: any, index: number) => {
          issues.push({
            id: `ling-${index}`,
            type: (issue.type as IssueType) || 'GRAMMAR',
            description: issue.description,
            suggestion: issue.suggestion,
            context: issue.context,
            severity: (issue.severity as IssueSeverity) || 'MEDIUM'
          });
        });
      }
      
      // Citation Analysis
      const referenceText = extractReferences(metadata.rawText);
      if (referenceText) {
        citationCountEstimate = referenceText.split('\n').filter(l => l.trim().length > 20).length;
        
        const citationResult = await validateCitations(referenceText);
        if (citationResult.issues) {
          citationResult.issues.forEach((issue: any, index: number) => {
            issues.push({
              id: `cite-${index}`,
              type: 'CITATION_STYLE',
              description: issue.description,
              suggestion: issue.suggestion,
              context: issue.context,
              severity: (issue.severity as IssueSeverity) || 'MEDIUM'
            });
          });
        }
      }
    } catch (err) {
      console.warn("Linguistic analysis failed", err);
    }
  } else {
    issues.push({
      id: 'text-empty',
      type: 'STRUCTURE',
      description: 'Document appears to be empty or text could not be extracted.',
      severity: 'HIGH'
    });
  }

  // Calculate Score
  const score = calculateScore(issues);

  return {
    score,
    issues,
    metadata: {
      pageCountEstimate: metadata.pageCount || 0,
      abstractWordCount: abstractCheck.wordCount,
      sections: structuralCheck.sections,
      citationCountEstimate,
      formatting: {
        margins: metadata.margins,
        fonts: Array.from(metadata.fonts),
        fontSizes: Array.from(metadata.fontSizes).map(s => metadata.sourceType === 'DOCX' ? s / 2 : s),
        lineSpacings: Array.from(metadata.lineSpacings),
        alignments: Array.from(metadata.alignments),
      },
      sourceType: metadata.sourceType,
      bannedWordsFound: bannedWordsCheck.bannedWordsFound,
      tableCount: tableFigureCheck.tableCount,
      figureCount: tableFigureCheck.figureCount,
    }
  };
};