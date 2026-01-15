/**
 * DCT CCS Capstone - Gemini AI Service
 * 
 * Provides AI-powered analysis for linguistic compliance checking
 * aligned with DCT CCS Capstone Manual requirements.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { BANNED_WORDS, CITATION_FORMAT, SAFE_REPLACEMENTS } from "../guidelines";

const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

// --- Mock Responses (for development without API key) ---

const mockAnalysis = () => ({
  score: 85,
  issues: [
    {
      type: "BANNED_WORD",
      description: "Usage of 'efficient' detected. This is a subjective marketing term.",
      suggestion: "Consider using 'effective', 'capable', or 'functional'.",
      context: "The proposed system is efficient in handling data.",
      severity: "MEDIUM"
    },
    {
      type: "BANNED_WORD",
      description: "Usage of 'user-friendly' is subjective.",
      suggestion: "Use 'accessible', 'usable', or describe specific usability features.",
      context: "The user interface was designed to be user-friendly.",
      severity: "MEDIUM"
    },
    {
      type: "TONE",
      description: "Passive voice overuse in academic writing.",
      suggestion: "Rewrite in active voice where appropriate to clarify the actor.",
      context: "The data was collected by the researchers using a survey.",
      severity: "LOW"
    }
  ]
});

const mockCitationAnalysis = () => ({
  issues: [
    {
      type: "CITATION_STYLE",
      description: "Citation does not follow DCT format [CODE] where CODE = first 4 letters of surname + year.",
      suggestion: "Use format: [MILL1991] Author, N. (1991). Title...",
      context: "Smith, J. (2020). The Study of Things.",
      severity: "MEDIUM"
    }
  ]
});

// Generate banned words list for prompt
const bannedWordsList = BANNED_WORDS.slice(0, 30).join(', ');
const safeReplacementExamples = Object.entries(SAFE_REPLACEMENTS)
  .slice(0, 5)
  .map(([banned, safe]) => `"${banned}" → ${safe.join('/')}`)
  .join('; ');

// --- Core Analysis ---

export const analyzeTextForCompliance = async (text: string) => {
  if (!apiKey) {
    console.warn("API Key is missing. Mocking response.");
    return mockAnalysis();
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `
        You are an academic editor for a DCT CCS (Dominican College of Tarlac, College of Computer Studies) Capstone project manuscript.
        
        Analyze the following text fragment for academic writing compliance.
        
        RULES TO CHECK:
        
        1. BANNED WORDS - Flag these subjective/marketing terms: ${bannedWordsList}
           Safe replacements: ${safeReplacementExamples}
        
        2. CONTRACTIONS - Academic writing should NOT use contractions (don't, can't, won't, it's, etc.)
        
        3. POINT OF VIEW - Must be third-person. Flag any use of "I", "we", "our", "my", "us"
        
        4. PASSIVE VOICE - Flag excessive passive voice where it makes the subject unclear
           (Some passive is acceptable in Methods sections)
        
        5. SENTENCE LENGTH - Flag overly long sentences (>30 words) that reduce clarity
        
        6. ACADEMIC TONE - Flag informal language, colloquialisms, or marketing speak
        
        IMPORTANT: For every issue found, provide the EXACT sentence from the text in the "context" field.
        
        Only report significant issues. Do not flag minor stylistic preferences.
        Maximum 10 issues per analysis.

        Text to Analyze:
        """
        ${text.substring(0, 15000)}
        """
      `,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { 
              type: Type.NUMBER, 
              description: "Academic tone compliance score from 0 to 100 (100 = perfect academic writing)" 
            },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { 
                    type: Type.STRING, 
                    description: "Type of issue: BANNED_WORD, GRAMMAR, TONE" 
                  },
                  description: { 
                    type: Type.STRING,
                    description: "Clear description of what the issue is"
                  },
                  suggestion: { 
                    type: Type.STRING,
                    description: "Specific suggestion for how to fix the issue"
                  },
                  severity: { 
                    type: Type.STRING, 
                    description: "HIGH (must fix), MEDIUM (should fix), LOW (minor)" 
                  },
                  context: { 
                    type: Type.STRING, 
                    description: "The EXACT sentence or phrase from the input text where this issue occurs" 
                  }
                },
                required: ["type", "description", "suggestion", "severity", "context"]
              }
            }
          },
          required: ["score", "issues"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    return mockAnalysis();
  }
};

export const validateCitations = async (referencesText: string) => {
  if (!apiKey || referencesText.length < 20) {
    return { issues: [] };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `
        You are a citation format validator for DCT CCS (Dominican College of Tarlac, College of Computer Studies) Capstone manuscripts.
        
        DCT CITATION FORMAT REQUIREMENTS:
        
        Citations should use this specific format with [CODE] identifiers:
        - CODE = First 4 characters of principal author's last name + 4-digit year
        - Example: [MILL1991]
        
        BOOK FORMAT:
        [CODE] <author's name> (<year>). <Book Title>, <site of publication>: <publisher>.
        Example: [MILL1991] Miller, A. (1991). Database Design, New York: Wiley.
        
        JOURNAL FORMAT:
        [CODE] <author's name> (<year>). '<article title>', Journal Title, volume(issue), <pages>.
        Example: [SMIT2020] Smith, J. (2020). 'Data Analysis Methods', Journal of CS, 15(2), 45-62.
        
        CONFERENCE FORMAT:
        [CODE] <author's name> (<year>). '<article title>', In: Conference Name (ed), <pages>. <site>: <publisher>.
        
        WEB FORMAT:
        [CODE] <author> (year). 'Page title'. URL
        
        IMPORTANT: Traditional footnote style is NOT allowed.
        
        Check each citation entry below for compliance with DCT format.
        For each error, copy the exact citation into 'context'.
        Only report formatting issues, not content issues.
        Maximum 5 issues.
        
        References Text:
        """
        ${referencesText.substring(0, 5000)}
        """
      `,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { 
                    type: Type.STRING, 
                    enum: ["CITATION_STYLE"] 
                  },
                  description: { 
                    type: Type.STRING,
                    description: "What is wrong with this citation" 
                  },
                  suggestion: { 
                    type: Type.STRING,
                    description: "How to fix it with DCT format example" 
                  },
                  severity: { 
                    type: Type.STRING, 
                    enum: ["HIGH", "MEDIUM", "LOW"] 
                  },
                  context: { 
                    type: Type.STRING, 
                    description: "The specific citation entry containing the error" 
                  }
                },
                required: ["type", "description", "suggestion", "severity", "context"]
              }
            }
          },
          required: ["issues"]
        }
      }
    });
    
    return JSON.parse(response.text || '{ "issues": [] }');
  } catch (error) {
    console.error("Gemini Citation Analysis Failed", error);
    return mockCitationAnalysis();
  }
};

// --- Chat Capability ---

export const createComplianceChat = (documentContext: string) => {
  if (!apiKey) return null;
  
  return ai.chats.create({
    model: 'gemini-2.0-flash',
    config: {
      systemInstruction: `
        You are "DocuBot", a helpful Academic Compliance Assistant for DCT CCS (Dominican College of Tarlac, College of Computer Studies) Capstone projects.
        
        YOUR KNOWLEDGE BASE:
        - DCT CCS Capstone Manual formatting requirements
        - Academic writing standards (third-person, no contractions, neutral tone)
        - DCT citation format: [CODE] where CODE = first 4 letters of author surname + year
        - Manuscript structure: Preliminary pages, Chapters 1-5, References, Appendices
        
        FORMATTING REQUIREMENTS:
        - Paper: 8.5x11, Portrait
        - Margins: Top 1", Bottom 1", Left 1.5", Right 1"
        - Font: Times New Roman, 11pt for content, 12pt for headings
        - Line Spacing: 1.5
        - Alignment: Justified
        - Abstract: 150-200 words
        
        YOUR RULES:
        1. NEVER rewrite the student's text. If asked, say: "I cannot rewrite this for you, but I can explain the rule and give examples."
        2. Explain the "Why" behind each rule (e.g., "1.5 inch left margins are required for binding...")
        3. Be professional, concise, and helpful
        4. Reference specific sections of the DCT CCS Capstone Manual when possible
        5. If unsure, admit uncertainty rather than inventing rules
        
        Current Document Issues Found:
        ${documentContext}
      `
    }
  });
};