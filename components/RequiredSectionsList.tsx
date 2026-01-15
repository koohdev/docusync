import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, Circle, AlertCircle } from 'lucide-react';
import { ComplianceMetadata } from '../types';

interface RequiredSectionsListProps {
    metadata?: ComplianceMetadata;
    onSelectSection?: (sectionName: string) => void;
    selectedSection?: string | null;
}

const RequiredSectionsList: React.FC<RequiredSectionsListProps> = ({ metadata, onSelectSection, selectedSection }) => {
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

    const SectionItem = ({ name }: { name: string }) => {
        const found = isSectionFound(name);
        const isSelected = selectedSection === name;

        return (
            <button
                onClick={() => onSelectSection?.(name)}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-left transition-all duration-200 group
                    ${isSelected 
                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' 
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
            >
                <div className="flex items-center gap-3">
                    {found ? (
                        <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-emerald-500'}`} />
                    ) : (
                        <Circle className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-300'}`} />
                    )}
                    <span className={`text-xs font-medium ${isSelected ? 'text-blue-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                        {name}
                    </span>
                </div>
                {!found && (
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Missing Section" />
                )}
            </button>
        );
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preliminaries</p>
                {sections.map((section, idx) => (
                    <SectionItem key={`pre-${idx}`} name={section.name} />
                ))}
            </div>

            <div className="space-y-2">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Main Body</p>
                {chapters.map((chapter) => (
                    <div key={`chapter-${chapter.num}`} className="rounded-xl overflow-hidden border border-slate-100/50 bg-white/50">
                        <button
                            onClick={() => toggleChapter(chapter.num)}
                            className="w-full flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 transition-colors"
                        >
                            <span className="font-semibold text-slate-700 text-xs">{chapter.name}</span>
                            <ChevronDown 
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                    expandedChapters.has(chapter.num) ? 'rotate-180' : ''
                                }`} 
                            />
                        </button>
                        {expandedChapters.has(chapter.num) && (
                            <div className="bg-slate-50/50 space-y-0.5 p-1 border-t border-slate-100">
                                {chapter.items.map((item, idx) => (
                                    <SectionItem key={`ch${chapter.num}-${idx}`} name={item} />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">End Matter</p>
                {endSections.map((section, idx) => (
                    <SectionItem key={`end-${idx}`} name={section} />
                ))}
            </div>
        </div>
    );
};

export default RequiredSectionsList;
