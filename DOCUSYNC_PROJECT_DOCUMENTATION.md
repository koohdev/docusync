# DS: An AI-Powered Manuscript Validation Framework with Intelligent Conversational Assistance for the DCT College of Computer Studies

**Product Name:** DocuSync

## 1.1 Project Context

The demand for digital solutions in academic institutions facilitates the transformation of educational processes. Higher education institutions face challenges in maintaining consistency and quality in student academic outputs. Capstone projects represent the culmination of undergraduate studies and require adherence to specific documentation standards. The complexity of these standards results in compliance issues that delay project completion. Addressing these challenges requires technology-driven solutions that support both students and academic advisers.

Globally, educational technology has experienced substantial growth in recent years. Research published by the World Economic Forum indicates that digital tools for education have expanded their reach across various nations. Universities in North America, Europe, and Asia utilize document management systems to handle large volumes of student submissions. These systems reduce administrative burdens and provide standardized frameworks for document processing. The integration of artificial intelligence into educational tools facilitates this transformation.

At the national level, the Philippines has witnessed a surge in educational technology adoption. The Commission on Higher Education mandates that degree programs in computing disciplines include capstone projects as a graduation requirement. The Department of Information and Communications Technology promotes automation tools to support academic institutions. Local universities and colleges seek solutions that align with these national directives while addressing institutional requirements. The need for localized compliance checking systems remains largely unaddressed in the Philippine context.

Within the regional and local scope, Dominican College of Tarlac maintains specific guidelines for Capstone project documentation. The DCT College of Computer Studies prescribes detailed formatting requirements that students must follow. These requirements encompass margin specifications, font standards, section structures, and citation formats. Students frequently encounter difficulties in meeting all prescribed guidelines simultaneously. Advisers dedicate considerable time reviewing manuscripts for compliance rather than focusing on content quality.

The existing documentation workflow at academic institutions relies heavily on manual review processes. Students submit manuscripts for evaluation, and advisers examine each document against established criteria. This approach consumes substantial time resources and introduces human error into the review process. Non-compliant submissions require multiple revision cycles before final acceptance. The repetitive nature of compliance checking provides an opportunity for automation through software systems.

Current technology trends support the development of automated document analysis tools. Natural language processing enables computers to evaluate written content against defined standards. Document parsing libraries facilitate the extraction of formatting data from word processing files. Cloud-based artificial intelligence services provide accessible interfaces for advanced analysis capabilities. These technologies form the foundation for building comprehensive document compliance solutions.

The proposed system, DocuSync, addresses the identified gaps in Capstone documentation workflows. DocuSync is a web-based application designed to automate the verification of manuscript compliance. The system parses uploaded documents and evaluates them against DCT CCS Capstone Manual requirements. It provides detailed feedback on formatting errors, structural deficiencies, and linguistic issues. The application supports both students seeking to verify their work and advisers monitoring group submissions.

DocuSync utilizes the Gemini artificial intelligence API for advanced linguistic analysis. The system detects banned words, evaluates academic tone, and validates citation formats through AI-powered processing. It generates compliance scores that quantify how well a document meets established standards. Users receive actionable suggestions for addressing identified issues in their manuscripts. This approach transforms document review from a manual task into an automated verification process.

The system distinguishes itself through its specific alignment with DCT CCS requirements. Unlike generic grammar checkers, DocuSync validates section structures mandated by the Capstone Manual. It verifies margin settings, font specifications, and line spacing parameters against institutional standards. The application checks abstract word counts and verifies that required sections appear in proper sequence. These capabilities address the unique compliance needs of DCT computing students.

Furthermore, DocuSync supports role-based access for different user categories. Students access the system to upload and analyze their draft manuscripts before adviser submission. Advisers utilize dashboard features to monitor compliance rates across their assigned groups. The dual-interface design facilitates collaboration between students and advisers throughout the documentation process. This structure promotes proactive compliance rather than reactive correction.

## 1.2 Objectives

### 1.2.1 General Objective
The general objective of this project is to develop a web-based document compliance verification system that automates the analysis of Capstone manuscripts against DCT CCS Capstone Manual requirements, providing students and advisers with detailed compliance reports and actionable improvement recommendations.

### 1.2.2 Specific Objectives
**A.** To design and develop a document parsing module that extracts formatting metadata from DOCX and PDF files. This module reads margin specifications, font families, font sizes, line spacing values, and text alignment settings from uploaded documents. The extracted data serves as input for subsequent compliance validation processes. The module handles both Microsoft Word documents and portable document formats to accommodate various submission types.

**B.** To implement a structural validation engine that verifies the presence and sequence of required manuscript sections. The engine checks for approval sheets, abstracts, table of contents, and all five main chapters prescribed by the Capstone Manual. It identifies missing sections and flags sections that appear out of their required order. Students receive specific guidance on structural corrections needed for compliance.

**C.** To integrate Gemini artificial intelligence capabilities for linguistic analysis of manuscript content. The AI module evaluates text samples for grammar issues, inappropriate tone, and usage of banned words. It validates citation formats against DCT reference standards. The integration provides analysis depth beyond what rule-based systems alone can achieve.

**D.** To develop a scoring algorithm that quantifies document compliance on a scale of zero to one hundred. The algorithm applies weighted penalties for issues based on severity classifications of high, medium, and low. Scores account for structural, formatting, and linguistic compliance categories. Users receive overall scores alongside category-specific assessments.

**E.** To create role-specific dashboards that serve distinct user needs within the system. The student dashboard displays submission history, compliance scores, and detailed issue reports. The adviser dashboard presents group overviews, submission tracking, and comparative compliance metrics. Both interfaces support the documentation review workflow at appropriate authority levels.

## 1.3 Scope and Limitations

### 1.3.1 Scope
**A. Document Format Support.** The system processes documents in DOCX and PDF formats. DOCX files receive comprehensive metadata extraction including margins, fonts, sizes, and spacing. PDF files undergo text extraction and approximate margin analysis based on text positioning. Users may upload documents up to reasonable size limits for web-based processing.

**B. Compliance Criteria Coverage.** The system validates documents against formatting requirements specified in the DCT CCS Capstone Manual. Checked parameters include left margins of one and a half inches, right margins of one inch, Times New Roman font family, and twelve-point font size. The system verifies 1.5 line spacing and justified text alignment for body content. Structural checks confirm presence of all required preliminary pages, chapters, and end matter sections.

**C. AI-Powered Analysis Features.** The system utilizes Gemini API for linguistic compliance analysis. AI evaluation identifies banned words commonly flagged in academic writing guidelines. The module assesses academic tone and suggests replacements for non-compliant terminology. Citation validation checks reference formatting against institutional standards.

**D. User Interface Components.** The application provides a landing page with role-based login for students and advisers. Student users access document upload functionality and view detailed analysis reports. Adviser users access group management features and aggregate compliance statistics. A compliance chat interface enables users to query AI assistance for document guidance.

**E. Compliance Reporting.** The system generates compliance reports for each analyzed document. Reports include overall scores, issue counts by category, and specific issue descriptions with suggestions. Metadata summaries display page counts, abstract word counts, and section detection results. Users may reference reports when making manuscript revisions.

### 1.3.2 Limitations
**A. Document Content Accuracy.** The system evaluates formatting and structure but does not assess technical accuracy of content. This limitation exists because subject matter correctness remains the responsibility of students and advisers. The system cannot verify whether stated methodologies match actual implementation details.

**B. Complex Layout Handling.** Documents with tables, images, and multi-column layouts may experience reduced parsing accuracy. This occurs because the system focuses on text content and standard paragraph formatting. Complex graphical elements do not contribute to analysis results to maintain processing speed.

**C. PDF Parsing Constraints.** PDF documents yield less detailed formatting metadata compared to DOCX files. This restriction is due to margin calculations on PDFs relying on text position inference rather than explicit properties. Font detection in PDFs depends on embedded font information availability.

**D. Internet Connectivity Requirement.** The system requires internet connectivity for AI-powered analysis features. This limitation is necessary because users without stable internet connections cannot access Gemini-based linguistic evaluation. Local-only document checks remain limited to rule-based validations without AI depth.

**E. Language Scope.** The system is designed for English-language documents only. This constraint ensures accuracy since non-English content may produce inaccurate linguistic analysis results. The banned word list and style guidelines reflect English academic writing conventions exclusively.

**F. Real-Time Processing Limits.** Large documents may require extended processing time for complete analysis. This limitation exists because the system processes documents asynchronously to maintain interface responsiveness. Users must wait for analysis completion before accessing full reports to verify results.

## Key System Features

**A. DCT CCS-Specific Compliance Engine.** DocuSync moves beyond generic grammar checking by integrating a validation engine explicitly coded with DCT CCS Capstone Manual requirements. This specificity verifies compliance on institutional mandates such as chapter sequence and preliminary page requirements. The engine enforces localized margin specifications that generic tools often overlook.

**B. Integrated AI-Powered Linguistic and Tone Analysis.** The system leverages the Gemini AI API to provide analysis beyond rule-based pattern matching. This integration enables contextual tone evaluation to identify inappropriate phrasing in academic writing. The AI module identifies banned terminology restricted by the DCT CCS guidelines and validates citation consistency.

**C. Proactive Compliance Scoring and Feedback.** DocuSync utilizes a weighted scoring algorithm that quantifies compliance across structural, formatting, and linguistic dimensions. This approach provides students with an objective measure of document readiness. The system provides actionable, location-specific suggestions for addressing identified formatting discrepancies.

**D. Conversational AI Guidance.** The inclusion of a compliance chat interface powered by AI provides a new approach to student support. This feature allows students to ask natural language questions regarding formatting requirements. The interface provides immediate guidance tailored to the DCT CCS Capstone Manual to assist in the documentation process.

**E. Role-Based Collaborative Dashboard.** DocuSync supports the documentation ecosystem by offering distinct dashboards for students and advisers. The adviser dashboard provides aggregate compliance metrics across assigned groups. This allows advisers to monitor progress and provide targeted intervention based on systemic compliance issues.

## User Stories

### Student User Stories
*   **Submission & Initial Check:** As a student, I want to upload my Capstone manuscript in DOCX or PDF format so that I can initiate the compliance verification process.
*   **Detailed Feedback & Reporting:** As a student, I want to receive a detailed compliance report that highlights specific formatting errors so that I know exactly what needs to be fixed.
*   **Structural Checklist:** As a student, I want to see a structural checklist showing if all required chapters and preliminary pages are present and in the correct order so that I can ensure my document structure is compliant.
*   **Compliance Score:** As a student, I want to see a quantifiable compliance score (0-100) after analysis so that I can quickly gauge the readiness of my document for adviser submission.
*   **AI-Enhanced Review:** As a student, I want the system to identify academic tone issues and banned words in my content using AI so that my manuscript meets high linguistic standards.
*   **Compliance Chat:** As a student, I want to use the compliance chat interface to ask the AI for advice on how to correctly implement a specific citation style so that I can fix my references accurately.
*   **Tracking & History:** As a student, I want a secure dashboard to view my submission history and previous reports so that I can track my revision progress over time.

### Adviser User Stories
*   **Group Oversight:** As an adviser, I want a dashboard that displays the aggregate compliance status of all students in my assigned groups so that I can quickly identify which students need immediate guidance.
*   **Issue Metrics:** As an adviser, I want to see metrics on the most common non-compliance issues across my groups so that I can adjust my guidance or lecture focus accordingly.
*   **Individual Review:** As an adviser, I want to view individual students' compliance scores and detailed reports so that I can provide targeted feedback instead of performing a manual compliance check.
*   **Mandatory Confirmation:** As an adviser, I want to confirm that a student has addressed all mandatory formatting and structural issues before I dedicate time to reviewing the technical content.
*   **Monitoring & Progress:** As an adviser, I want to track submission dates and version history for each group's manuscript so that I can monitor the overall documentation timeline and progress.
