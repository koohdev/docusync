import React, { useState } from 'react';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import { ComplianceMetadata } from '../types';

interface RequiredSectionsListProps {
    metadata?: ComplianceMetadata;
}

const RequiredSectionsList: React.FC<RequiredSectionsListProps> = ({ metadata }) => {
    const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));
    
    // Helper function to check if a section is found
    const isSectionFound = (sectionName: string): boolean => {
        if (!metadata?.sections) return false;
        return metadata.sections.some(s => {
            const normalizedMetadata = s.name.toLowerCase().replace(/_/g, ' ');
            const normalizedSection = sectionName.toLowerCase();
            return (normalizedMetadata.includes(normalizedSection) || normalizedSection.includes(normalizedMetadata)) && s.found;
        });
    };
    
    const toggleChapter = (chapterNum: number) => {
        setExpandedChapters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chapterNum)) {
                newSet.delete(chapterNum);
            } else {
                newSet.add(chapterNum);
            }
            return newSet;
        });
    };

    const sections = [
        { name: 'Title page' },
        { name: "Adviser's recommendation sheet" },
        { name: "Dean's acceptance sheet" },
        { name: "Panel's approval sheet" },
        { name: 'Acknowledgement' },
        { name: 'Abstract' },
        { name: 'Table of contents' },
        { name: 'List of tables' },
        { name: 'List of figures' },
        { name: 'List of notations' },
    ];

    const chapters = [
        {
            num: 1,
            name: 'Chapter 1',
            items: [
                '1.0 Introduction',
                '1.1 Project context',
                '1.2 Objectives',
                '1.2.1 General objective',
                '1.2.2 Specific objectives',
                '1.3 Scope and limitations'
            ]
        },
        {
            num: 2,
            name: 'Chapter 2',
            items: ['2.0 Review of related literature/systems']
        },
        {
            num: 3,
            name: 'Chapter 3',
            items: [
                '3.0 Technical background',
                '3.1 Development',
                '3.2 Implementation'
            ]
        },
        {
            num: 4,
            name: 'Chapter 4',
            items: [
                '4.0 Methodology, results and discussion',
                '4.1 Methodology',
                '4.2 Environment',
                '4.3 Requirements specifications',
                '4.4 Design',
                '4.5 Development',
                '4.6 Verification, validation, testing',
                '4.7 Implementation plan',
                '4.8 Installation processes'
            ]
        },
        {
            num: 5,
            name: 'Chapter 5',
            items: ['5.0 Conclusion and recommendations']
        }
    ];

    const endSections = [
        'References',
        'Resource persons',
        'Glossary',
        'Appendices'
    ];

    return (
        <div className="space-y-1 text-sm">
            {/* Pre-chapter sections */}
            {sections.map((section, idx) => {
                const found = isSectionFound(section.name);
                return (
                    <div key={`pre-${idx}`} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-50 transition-colors">
                        <span className={`text-xs ${found ? 'text-slate-700' : 'text-slate-400'}`}>{section.name}</span>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${found ? 'text-emerald-500' : 'text-slate-300'}`} />
                    </div>
                );
            })}

            {/* Chapters */}
            {chapters.map((chapter) => (
                <div key={`chapter-${chapter.num}`} className="border-t border-slate-100">
                    <button
                        onClick={() => toggleChapter(chapter.num)}
                        className="w-full flex items-center justify-between py-2 px-2 rounded hover:bg-slate-50 transition-colors group"
                    >
                        <span className="font-semibold text-slate-700 text-xs">{chapter.name}</span>
                        <ChevronDown 
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                expandedChapters.has(chapter.num) ? 'rotate-180' : ''
                            }`} 
                        />
                    </button>
                    {expandedChapters.has(chapter.num) && (
                        <div className="ml-3 space-y-0.5 pb-1">
                            {chapter.items.map((item, idx) => {
                                const found = isSectionFound(item);
                                return (
                                    <div key={`ch${chapter.num}-${idx}`} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-50 transition-colors">
                                        <span className={`text-xs ${found ? 'text-slate-700' : 'text-slate-400'}`}>{item}</span>
                                        <CheckCircle2 className={`w-3.5 h-3.5 ${found ? 'text-emerald-500' : 'text-slate-300'}`} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}

            {/* End sections */}
            <div className="border-t border-slate-100">
                {endSections.map((section, idx) => {
                    const found = isSectionFound(section);
                    return (
                        <div key={`end-${idx}`} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-50 transition-colors">
                            <span className={`text-xs ${found ? 'text-slate-700' : 'text-slate-400'}`}>{section}</span>
                            <CheckCircle2 className={`w-3.5 h-3.5 ${found ? 'text-emerald-500' : 'text-slate-300'}`} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RequiredSectionsList;
