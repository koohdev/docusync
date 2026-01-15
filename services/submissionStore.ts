import { Submission, ComplianceStatus } from '../types';

const STORAGE_KEY = 'docusync_submissions';

const generateMockSubmissions = (): Submission[] => [
    {
        id: 'mock-1',
        fileName: 'Capstone_GroupA_Draft1.docx',
        studentName: 'Group Alpha',
        groupName: 'Group Alpha',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        score: 85,
        status: ComplianceStatus.COMPLIANT,
        issues: [
            { id: 'm1', type: 'GRAMMAR', description: 'Minor passive voice detected.', severity: 'LOW' }
        ],
        metadata: {
            pageCountEstimate: 45,
            abstractWordCount: 180,
            sections: [
                { key: 'PANEL_APPROVAL', name: 'Panel\'s Approval Sheet', found: true, required: true },
                { key: 'ABSTRACT', name: 'Abstract', found: true, required: true }
            ],
            citationCountEstimate: 12
        }
    },
    {
        id: 'mock-2',
        fileName: 'Inventory_System_v2.pdf',
        studentName: 'Group Beta',
        groupName: 'Group Beta',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        score: 65,
        status: ComplianceStatus.REVIEW_REQUIRED,
        issues: [
            { id: 'm2', type: 'MARGIN', description: 'Left margin 1.0" (Expected 1.5")', severity: 'HIGH' },
            { id: 'm3', type: 'STRUCTURE', description: 'Missing References section', severity: 'HIGH' }
        ],
        metadata: {
            pageCountEstimate: 32,
            abstractWordCount: 120,
            sections: [
                { key: 'PANEL_APPROVAL', name: 'Panel\'s Approval Sheet', found: true, required: true },
                { key: 'ABSTRACT', name: 'Abstract', found: true, required: true },
                { key: 'REFERENCES', name: 'References', found: false, required: true }
            ],
            citationCountEstimate: 0
        }
    },
    {
        id: 'mock-3',
        fileName: 'Library_Kiosk_Final.docx',
        studentName: 'Group Gamma',
        groupName: 'Group Gamma',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        score: 92,
        status: ComplianceStatus.COMPLIANT,
        issues: [],
        metadata: {
            pageCountEstimate: 50,
            abstractWordCount: 210,
            sections: [
                { key: 'PANEL_APPROVAL', name: 'Panel\'s Approval Sheet', found: true, required: true },
                { key: 'ABSTRACT', name: 'Abstract', found: true, required: true }
            ],
            citationCountEstimate: 25
        }
    }
];

export const submissionStore = {
    getAll: (): Submission[] => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            const mocks = generateMockSubmissions();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mocks));
            return mocks;
        }
        return JSON.parse(stored);
    },

    save: (submission: Submission) => {
        const submissions = submissionStore.getAll();
        // Add to top
        submissions.unshift(submission);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    },

    getById: (id: string): Submission | undefined => {
        const submissions = submissionStore.getAll();
        return submissions.find(s => s.id === id);
    }
};