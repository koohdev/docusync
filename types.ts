export enum UserRole {
  GUEST = 'GUEST',
  STUDENT = 'STUDENT',
  ADVISER = 'ADVISER'
}

export enum ComplianceStatus {
  PENDING = 'Pending',
  COMPLIANT = 'Compliant',
  NON_COMPLIANT = 'Non-Compliant',
  REVIEW_REQUIRED = 'Review Required'
}

// Issue types aligned with DCT CCS Capstone Manual categories
export type IssueType = 
  | 'FORMATTING'      // Margins, fonts, spacing
  | 'STRUCTURE'       // Missing/out-of-order sections
  | 'GRAMMAR'         // Grammar and syntax
  | 'BANNED_WORD'     // Prohibited terminology
  | 'TONE'            // Academic tone violations
  | 'CITATION_STYLE'  // DCT citation format issues
  | 'ABSTRACT'        // Abstract-specific issues
  | 'PAGINATION'      // Page numbering issues
  | 'TABLE_FIGURE'    // Table/Figure caption format
  | 'PROJECT_TYPE'    // Unacceptable project type
  | 'SPACING'         // Line spacing issues
  | 'ALIGNMENT'       // Text alignment issues
  | 'FONT'            // Font family/size issues
  | 'MARGIN';         // Margin-specific issues

export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AuditIssue {
  id: string;
  type: IssueType;
  description: string;
  suggestion?: string;
  location?: string; // e.g., "Chapter 1.1"
  context?: string;  // The specific sentence or phrase from the text
  severity: IssueSeverity;
}

export interface SectionStatus {
  key: string;
  name: string;
  found: boolean;
  required: boolean;
  pageNumberStyle?: 'roman' | 'arabic' | 'none';
}

export interface FormattingMetadata {
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | null;
  fonts: string[];
  fontSizes: number[];
  lineSpacings: number[];
  alignments: string[];
}

export interface ComplianceMetadata {
  pageCountEstimate: number;
  abstractWordCount: number;
  sections: SectionStatus[];
  citationCountEstimate: number;
  formatting?: FormattingMetadata;
  sourceType?: 'DOCX' | 'PDF';
  bannedWordsFound?: string[];
  tableCount?: number;
  figureCount?: number;
}

export interface Manuscript {
  id: string;
  title: string;
  uploadedBy: string;
  dateUploaded: string;
  status: ComplianceStatus;
  score: number; // 0-100
  issues: AuditIssue[];
}

export interface Submission {
  id: string;
  fileName: string;
  studentName: string;
  groupName: string;
  date: string;
  score: number;
  status: ComplianceStatus;
  issues: AuditIssue[];
  metadata?: ComplianceMetadata;
}

export interface StudentGroup {
  id: string;
  name: string;
  projectTitle: string;
  members: string[];
  lastSubmission: string;
  complianceRate: number;
}