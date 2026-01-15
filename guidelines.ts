/**
 * DCT CCS Capstone Documentation Guidelines
 * Source: Capstone_Guidelines_Chapters (Official DCT CCS Capstone Manual)
 * 
 * This configuration file contains all formatting, structural, and content
 * requirements for Capstone documentation compliance checking.
 */

// ============================================================================
// FORMATTING STANDARDS (Section 10.3)
// ============================================================================

export const PAPER_SPECS = {
  size: { width: 8.5, height: 11 }, // inches
  orientation: 'portrait', // except for special diagrams
  substance: 20,
} as const;

export const MARGIN_SPECS = {
  top: 1.0,      // inches
  bottom: 1.0,   // inches
  left: 1.5,     // inches
  right: 1.0,    // inches
  gutter: 0,     // inches
  header: 0.5,   // inches
  footer: 0.5,   // inches
} as const;

// Convert to twips for DOCX parsing (1 inch = 1440 twips)
export const TWIPS_PER_INCH = 1440;
export const MARGIN_SPECS_TWIPS = {
  top: MARGIN_SPECS.top * TWIPS_PER_INCH,       // 1440
  bottom: MARGIN_SPECS.bottom * TWIPS_PER_INCH, // 1440
  left: MARGIN_SPECS.left * TWIPS_PER_INCH,     // 2160
  right: MARGIN_SPECS.right * TWIPS_PER_INCH,   // 1440
} as const;

export const SPACING_SPECS = {
  lineSpacing: 1.5,          // inches (Section 10.3.B)
  lineSpacingTwips: 360,     // 1.5 spacing = 360 twips
  indentation: 1.0,          // inches (Section 10.3.C)
  indentationTwips: 1440,
} as const;

export const FONT_SPECS = {
  family: 'Times New Roman',
  color: 'black',
  sizes: {
    heading1: 12,    // points
    heading2: 12,    // points
    heading3: 11,    // points
    content: 11,     // points (Note: Section 10.3.E specifies 11pt for content)
    tableTitle: 14,  // bold
    figureTitle: 14, // bold
  },
} as const;

export const PAGINATION_SPECS = {
  position: 'bottom-right',
  preliminaryStyle: 'roman',    // i, ii, iii, iv, v...
  mainBodyStyle: 'arabic',      // 1, 2, 3...
  firstPageOfChapter: 'hidden', // No page number on first page of each chapter
} as const;

// ============================================================================
// DOCUMENT STRUCTURE (Section 10.1 - Documentation Outline)
// ============================================================================

export interface SectionDefinition {
  key: string;
  displayName: string;
  regex: RegExp;
  required: boolean;
  pageNumberStyle: 'roman' | 'arabic' | 'none';
  minPages?: number;
  description?: string;
}

export const PRELIMINARY_PAGES: SectionDefinition[] = [
  {
    key: 'TITLE_PAGE',
    displayName: 'Title Page',
    regex: /DOMINICAN\s+COLLEGE\s+OF\s+TARLAC|THESIS\s+TITLE/i,
    required: true,
    pageNumberStyle: 'none',
    description: 'Concise, descriptive title. Begins with noun or present participle. No humorous or catchy titles.',
  },
  {
    key: 'ADVISER_RECOMMENDATION',
    displayName: "Adviser's Recommendation Sheet",
    regex: /ADVISER['']?S?\s+RECOMMENDATION\s+SHEET/i,
    required: true,
    pageNumberStyle: 'none',
  },
  {
    key: 'DEAN_ACCEPTANCE',
    displayName: "Dean's Acceptance Sheet",
    regex: /DEAN['']?S?\s+ACCEPTANCE\s+SHEET/i,
    required: true,
    pageNumberStyle: 'none',
  },
  {
    key: 'PANEL_APPROVAL',
    displayName: "Panel's Approval Sheet",
    regex: /PANEL['']?S?\s+APPROVAL\s+SHEET/i,
    required: true,
    pageNumberStyle: 'none',
  },
  {
    key: 'ACKNOWLEDGEMENT',
    displayName: 'Acknowledgement',
    regex: /ACKNOWLEDG(?:E)?MENT/i,
    required: true,
    pageNumberStyle: 'roman',
  },
  {
    key: 'ABSTRACT',
    displayName: 'Abstract',
    regex: /\bABSTRACT\b/i,
    required: true,
    pageNumberStyle: 'roman',
    description: '150-200 words. Informative, states rationale and objectives. No citations or quotes. Do not begin with "This paper/document/project..."',
  },
  {
    key: 'TABLE_OF_CONTENTS',
    displayName: 'Table of Contents',
    regex: /TABLE\s+OF\s+CONTENTS/i,
    required: true,
    pageNumberStyle: 'roman',
  },
  {
    key: 'LIST_OF_TABLES',
    displayName: 'List of Tables',
    regex: /LIST\s+OF\s+TABLES/i,
    required: true,
    pageNumberStyle: 'roman',
    description: 'Format: Table <chapter#> - <table#> <Table Caption> <page>',
  },
  {
    key: 'LIST_OF_FIGURES',
    displayName: 'List of Figures',
    regex: /LIST\s+OF\s+FIGURES/i,
    required: true,
    pageNumberStyle: 'roman',
    description: 'Format: Figure <chapter#> - <figure#> <Figure Caption> <page>',
  },
  {
    key: 'LIST_OF_NOTATIONS',
    displayName: 'List of Notations',
    regex: /LIST\s+OF\s+NOTATIONS/i,
    required: false, // Optional
    pageNumberStyle: 'roman',
  },
];

export const MAIN_CHAPTERS: SectionDefinition[] = [
  {
    key: 'CHAPTER_1',
    displayName: '1.0 Introduction',
    regex: /(?:^|\n)\s*(?:CHAPTER\s+(?:1|I|ONE)|1\.0)\s*[:\-–]?\s*INTRODUCTION/i,
    required: true,
    pageNumberStyle: 'arabic',
    minPages: 2,
    description: 'Includes Project Context, Objectives (General & Specific - SMART), Scope and Limitations',
  },
  {
    key: 'CHAPTER_1_1',
    displayName: '1.1 Project Context',
    regex: /1\.1\s*[:\-–]?\s*PROJECT\s+CONTEXT/i,
    required: true,
    pageNumberStyle: 'arabic',
    minPages: 2,
    description: 'Global, national, regional/local scope. At least 2 pages.',
  },
  {
    key: 'CHAPTER_1_2',
    displayName: '1.2 Objectives',
    regex: /1\.2\s*[:\-–]?\s*OBJECTIVES/i,
    required: true,
    pageNumberStyle: 'arabic',
  },
  {
    key: 'CHAPTER_1_2_1',
    displayName: '1.2.1 General Objective',
    regex: /1\.2\.1\s*[:\-–]?\s*(?:GENERAL\s+)?OBJECTIVE/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Single paragraph describing general objective',
  },
  {
    key: 'CHAPTER_1_2_2',
    displayName: '1.2.2 Specific Objectives',
    regex: /1\.2\.2\s*[:\-–]?\s*SPECIFIC\s+OBJECTIVES/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'List of specific work items. Must be SMART.',
  },
  {
    key: 'CHAPTER_1_3',
    displayName: '1.3 Scope and Limitations',
    regex: /1\.3\s*[:\-–]?\s*SCOPE\s+AND\s+LIMITATIONS/i,
    required: true,
    pageNumberStyle: 'arabic',
  },
  {
    key: 'CHAPTER_2',
    displayName: '2.0 Review of Related Literature/Systems',
    regex: /(?:^|\n)\s*(?:CHAPTER\s+(?:2|II|TWO)|2\.0)\s*[:\-–]?\s*REVIEW\s+OF\s+RELATED/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Related Theories (anchor + supporting), Related Projects (3-6 studies, comparative matrix)',
  },
  {
    key: 'CHAPTER_3',
    displayName: '3.0 Technical Background',
    regex: /(?:^|\n)\s*(?:CHAPTER\s+(?:3|III|THREE)|3\.0)\s*[:\-–]?\s*TECHNICAL\s+BACKGROUND/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Hardware, Software, Peopleware, Network technologies',
  },
  {
    key: 'CHAPTER_3_1',
    displayName: '3.1 Development',
    regex: /3\.1\s*[:\-–]?\s*DEVELOPMENT/i,
    required: true,
    pageNumberStyle: 'arabic',
  },
  {
    key: 'CHAPTER_3_2',
    displayName: '3.2 Implementation',
    regex: /3\.2\s*[:\-–]?\s*IMPLEMENTATION/i,
    required: true,
    pageNumberStyle: 'arabic',
  },
  {
    key: 'CHAPTER_4',
    displayName: '4.0 Methodology, Results and Discussion',
    regex: /(?:^|\n)\s*(?:CHAPTER\s+(?:4|IV|FOUR)|4\.0)\s*[:\-–]?\s*METHODOLOGY/i,
    required: true,
    pageNumberStyle: 'arabic',
  },
  {
    key: 'CHAPTER_4_1',
    displayName: '4.1 Methodology',
    regex: /4\.1\s*[:\-–]?\s*METHODOLOGY/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Formal SDLC methodology',
  },
  {
    key: 'CHAPTER_4_2',
    displayName: '4.2 Environment',
    regex: /4\.2\s*[:\-–]?\s*ENVIRONMENT/i,
    required: false, // Only for organization-specific capstone
    pageNumberStyle: 'arabic',
    description: 'Locale, Population, Organizational Chart (organization-specific only)',
  },
  {
    key: 'CHAPTER_4_3',
    displayName: '4.3 Requirements Specifications',
    regex: /4\.3\s*[:\-–]?\s*REQUIREMENTS?\s+SPECIFICATIONS?/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Operational, Technical, Schedule, Economic Feasibility + Requirements Modeling + Risk Assessment',
  },
  {
    key: 'CHAPTER_4_4',
    displayName: '4.4 Design',
    regex: /4\.4\s*[:\-–]?\s*DESIGN/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Output/UI Design, Data Design (ERD, Data Dictionary), System Architecture',
  },
  {
    key: 'CHAPTER_4_5',
    displayName: '4.5 Development',
    regex: /4\.5\s*[:\-–]?\s*DEVELOPMENT/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Software/Hardware/Program Spec, Programming Environment, Deployment Diagram, Test Plan',
  },
  {
    key: 'CHAPTER_4_6',
    displayName: '4.6 Verification, Validation, Testing',
    regex: /4\.6\s*[:\-–]?\s*(?:VERIFICATION|VALIDATION|TESTING)/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Unit, Integration, System, Acceptance Testing',
  },
  {
    key: 'CHAPTER_4_7',
    displayName: '4.7 Implementation Plan',
    regex: /4\.7\s*[:\-–]?\s*IMPLEMENTATION\s+PLAN/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Physical Environment, Interfaces, Functionality, Data, Security',
  },
  {
    key: 'CHAPTER_4_8',
    displayName: '4.8 Installation Processes',
    regex: /4\.8\s*[:\-–]?\s*INSTALLATION/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Direct, Gradual, or Parallel changeover approach',
  },
  {
    key: 'CHAPTER_5',
    displayName: '5.0 Conclusion and Recommendations',
    regex: /(?:^|\n)\s*(?:CHAPTER\s+(?:5|V|FIVE)|5\.0)\s*[:\-–]?\s*CONCLUSION/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Conclusions aligned with objectives. Recommendations for future work.',
  },
];

export const END_MATTER: SectionDefinition[] = [
  {
    key: 'REFERENCES',
    displayName: 'References',
    regex: /(?:REFERENCES|BIBLIOGRAPHY)/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Use DCT citation format: [CODE] where CODE = first 4 chars of author surname + year',
  },
  {
    key: 'RESOURCE_PERSONS',
    displayName: 'Resource Persons',
    regex: /RESOURCE\s+PERSONS?/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Full name, Title, Profession, Department, Institution, Contact',
  },
  {
    key: 'GLOSSARY',
    displayName: 'Glossary',
    regex: /\bGLOSSARY\b/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Terms defined operationally, arranged alphabetically',
  },
  {
    key: 'APPENDICES',
    displayName: 'Appendices',
    regex: /APPENDI(?:X|CES)/i,
    required: true,
    pageNumberStyle: 'arabic',
    description: 'Appendix A-J: Work Assignment, Definition of Terms, Evaluation Tools, User Manual, Program Listing, Certifications, Forms, Screen Design, Others, CV',
  },
];

// All sections in order for sequence validation
export const ALL_SECTIONS: SectionDefinition[] = [
  ...PRELIMINARY_PAGES,
  ...MAIN_CHAPTERS,
  ...END_MATTER,
];

// ============================================================================
// ABSTRACT REQUIREMENTS
// ============================================================================

export const ABSTRACT_SPECS = {
  minWords: 150,
  maxWords: 200,
  bannedPhrases: [
    /^this\s+paper/i,
    /^this\s+document/i,
    /^this\s+project/i,
    /^this\s+study/i,
    /^this\s+thesis/i,
    /^this\s+capstone/i,
  ],
  noCitations: true,
  noQuotes: true,
} as const;

// ============================================================================
// CITATION FORMAT (DCT Style)
// ============================================================================

export const CITATION_FORMAT = {
  style: 'DCT',
  codePattern: /\[([A-Z]{4}\d{4})\]/g, // [MILL1991] format
  description: 'First 4 characters of principal author last name + year of publication',
  examples: {
    book: '[CODE] <author name> (<year>). <Book Title>, <site>: <publisher>.',
    journal: "[CODE] <author name> (<year>). '<article title>', Journal Title, vol(issue), <pages>.",
    conference: "[CODE] <author name> (<year>). '<article title>', In: Conference Name (ed), <pages>. <site>: <publisher>.",
    web: "[CODE] <author> (year). 'Page title'. URL",
  },
  noTraditionalFootnotes: true,
} as const;

// ============================================================================
// TABLE AND FIGURE FORMATS
// ============================================================================

export const TABLE_FORMAT = {
  pattern: /Table\s+(\d+)\s*[-–]\s*(\d+)\s+(.+)/i,
  example: 'Table 1-2 Percentage Ratio of Sophomore vs. Seniors',
  description: 'Table <chapter#> - <table#> <Table Caption>',
} as const;

export const FIGURE_FORMAT = {
  pattern: /Figure\s+(\d+)\s*[-–]\s*(\d+)\s+(.+)/i,
  example: 'Figure 2-2 Systems Development Life Cycle',
  description: 'Figure <chapter#> - <figure#> <Figure Caption>',
} as const;

// ============================================================================
// UNACCEPTABLE PROJECT TYPES (Section 11.0)
// ============================================================================

export const UNACCEPTABLE_PROJECTS = [
  'DAMATH',
  'Video Rental System',
  'Card Games',
  'Non-educational Games',
  'Record Keeping Systems', // standalone
  'Monitoring System', // basic standalone
  'Barangay Website',
  'Municipality Website',
  'City Website',
  'Provincial Website',
] as const;

export const UNACCEPTABLE_PROJECT_PATTERNS = [
  /\bDAMATH\b/i,
  /video\s+rental/i,
  /card\s+game/i,
  /\b(basic|simple)\s+record\s*keeping/i,
  /\b(basic|simple)\s+monitoring\s+system/i,
  /barangay\s+(website|portal|page)/i,
  /municipality\s+(website|portal|page)/i,
  /\bcity\s+(website|portal|page)\b/i,
  /provincial\s+(website|portal|page)/i,
] as const;

// ============================================================================
// GRADING RUBRIC ALIGNMENT (Section 8.0)
// ============================================================================

export const GRADING_RUBRIC = {
  manuscriptMechanics: {
    points: 5,
    criteria: [
      'Organization and fluidity of ideas are apparent',
      'Formatting and layout are consistent',
      'All parts grammatically correct',
    ],
  },
  chapter1: {
    points: 10,
    criteria: [
      'Introduction is intact and provides clear overview',
      'Objectives are SMART',
      'Scope and Limitations clearly defined',
    ],
  },
  chapter2: {
    points: 8,
    criteria: [
      'Related literatures are recent and relevant',
      'Anchor provides solid background',
      'Auxiliary theories evident',
      'Sources appropriately cited',
      'Related studies include global and local scope',
    ],
  },
  chapter3: {
    points: 8,
    criteria: [
      'Comprehensive discussions on technologies',
      'Related past capstone projects discussed',
    ],
  },
  chapter4: {
    points: 10,
    criteria: [
      'Methodology follows SDLC',
      'Project management techniques appropriate',
      'Requirements specification complete',
      'Design tools relevant and appropriate',
      'Development plan concrete and consistent',
      'Testing assesses all aspects',
      'Implementation plan aligned with objectives',
    ],
  },
  finalPages: {
    points: 3,
    criteria: [
      'Conclusions attuned with objectives',
      'Recommendations feasible and practical',
      'Glossary defined operationally and alphabetical',
      'Bibliography in proper format',
      'Appendices relevant and complete',
    ],
  },
  appendices: {
    points: 2,
    criteria: [
      'Deliverables compiled intact and complete',
    ],
  },
  initialPages: {
    points: 4,
    criteria: [
      'Table of contents consistent',
      'Acknowledgement brief and formal',
      'Abstract brief but complete',
    ],
  },
} as const;

// ============================================================================
// SMART OBJECTIVES VALIDATION
// ============================================================================

export const SMART_CRITERIA = {
  S: 'Specific - The problem should be specifically stated',
  M: 'Measurable - Easy to measure using research instruments',
  A: 'Achievable - Solutions are feasible',
  R: 'Realistic - Real results gathered scientifically',
  T: 'Time-Bound - Time frame required for activities',
} as const;

// ============================================================================
// BANNED WORDS / ACADEMIC TONE
// ============================================================================

export const BANNED_WORDS = [
  // Subjective/marketing terms
  'efficient',
  'innovative',
  'improve',
  'enhance',
  'user-friendly',
  'robust',
  'scalable',
  'cutting-edge',
  'state-of-the-art',
  'revolutionary',
  'groundbreaking',
  'seamless',
  'intuitive',
  'optimal',
  'best',
  'better',
  'worst',
  'amazing',
  'incredible',
  'powerful',
  'unique',
  'superior',
  'excellent',
  'perfect',
  'ideal',
  // Informal terms
  'a lot',
  'lots of',
  'really',
  'very',
  'basically',
  'actually',
  'literally',
  'obviously',
  'clearly',
  'of course',
  'needless to say',
  'in my opinion',
  'I think',
  'I believe',
  'we feel',
  // Contractions (not allowed in academic writing)
  "can't",
  "won't",
  "don't",
  "doesn't",
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
  "haven't",
  "hasn't",
  "hadn't",
  "couldn't",
  "wouldn't",
  "shouldn't",
  "it's",
  "that's",
  "there's",
  "here's",
  "what's",
  "who's",
  "let's",
] as const;

export const SAFE_REPLACEMENTS: Record<string, string[]> = {
  'efficient': ['effective', 'capable', 'functional'],
  'innovative': ['novel', 'distinct', 'contemporary'],
  'improve': ['develop', 'refine', 'modify'],
  'enhance': ['augment', 'extend', 'expand'],
  'user-friendly': ['accessible', 'usable', 'intuitive'],
  'robust': ['reliable', 'stable', 'consistent'],
  'scalable': ['extensible', 'adaptable', 'flexible'],
  'unique': ['distinct', 'specific', 'particular'],
  'best': ['preferred', 'recommended', 'suitable'],
  'better': ['more suitable', 'preferable', 'advantageous'],
} as const;

// ============================================================================
// TOLERANCE VALUES FOR VALIDATION
// ============================================================================

export const TOLERANCES = {
  marginTwips: 50,         // ±50 twips tolerance for margins
  marginPoints: 5,         // ±5 points for PDF margins
  fontSizePoints: 0.5,     // ±0.5pt tolerance for font size
  spacingTwips: 20,        // ±20 twips for line spacing
} as const;

// ============================================================================
// SCORING WEIGHTS
// ============================================================================

export const SCORING = {
  maxScore: 100,
  penalties: {
    structure: {
      high: 15,
      medium: 8,
      low: 3,
    },
    formatting: {
      high: 10,
      medium: 5,
      low: 2,
    },
    linguistic: {
      high: 8,
      medium: 4,
      low: 2,
      maxPenalty: 25, // Cap
    },
    citation: {
      high: 8,
      medium: 4,
      low: 2,
      maxPenalty: 15, // Cap
    },
  },
} as const;

// ============================================================================
// ISSUE SEVERITY DEFINITIONS
// ============================================================================

export type IssueSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export const SEVERITY_DESCRIPTIONS = {
  HIGH: 'Critical issue that must be fixed before submission',
  MEDIUM: 'Notable issue that should be addressed',
  LOW: 'Minor suggestion for improvement',
} as const;
