import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AuditIssue, ComplianceStatus, ComplianceMetadata } from '../types';
import { 

    CheckCircle2, 
    ArrowLeft, 
    Printer, 
    AlertTriangle, 
    Info, 
    FileText, 
    HelpCircle, 
    Quote, 
    AlertOctagon, 
    BookOpen,
    AlignLeft,
    Hash,
    ChevronDown,
    MessageCircle,
    XCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import jspdfAutotable from 'jspdf-autotable';
import ComplianceChat from './ComplianceChat';
import RequiredSectionsList from './RequiredSectionsList';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AnalysisReportProps {
  score: number;
  status: ComplianceStatus;
  issues: AuditIssue[];
  metadata?: ComplianceMetadata;
  onClose: () => void;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ score, status, issues, metadata, onClose }) => {
    const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'FORMATTING' | 'GRAMMAR'>('ALL');
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatQuery, setChatQuery] = useState<string | undefined>(undefined);

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const autoTable = (jspdfAutotable as any).default || jspdfAutotable;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59);
        doc.text("DocuSync Audit Report", 14, 20);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
        doc.text(`Overall Score: ${score}/100`, 14, 32);

        const tableData = issues.map(issue => [
            issue.severity,
            issue.type,
            issue.description,
            issue.suggestion || '-'
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Severity', 'Type', 'Finding', 'Suggestion']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: 255 },
            styles: { fontSize: 9, cellPadding: 3 },
            didParseCell: function(data: any) {
                if (data.section === 'body') {
                    const severity = data.row.raw[0];
                    if (severity === 'HIGH') {
                         data.cell.styles.textColor = [185, 28, 28];
                         data.cell.styles.fontStyle = 'bold';
                    }
                }
            }
        });

        doc.save("docusync_audit_report.pdf");
    };

    const handleExplainIssue = (issue: AuditIssue) => {
        setChatQuery(`Explain the formatting rule regarding: "${issue.description}" in the context of: "${issue.context || 'general rules'}". Why is this a problem in a thesis?`);
        setChatOpen(true);
    };

    // Helper to highlight specific words
    const renderHighlightedContext = (context: string, description: string) => {
        if (!context) return null;
        const quotedTerms = description.match(/'([^']+)'/g)?.map(s => s.replace(/'/g, '')) || [];
        
        if (quotedTerms.length === 0) return <span className="text-slate-600 font-mono text-xs leading-relaxed">{context}</span>;

        const pattern = new RegExp(`(${quotedTerms.join('|')})`, 'gi');
        const parts = context.split(pattern);

        return (
            <span className="text-slate-600 font-mono text-xs leading-relaxed">
                {parts.map((part, i) => 
                    quotedTerms.some(term => term.toLowerCase() === part.toLowerCase()) ? (
                        <span key={i} className="bg-red-100 text-red-700 font-bold px-1 rounded mx-0.5 border border-red-200">
                            {part}
                        </span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    // Derived State
    const scoreData = [
        { name: 'Score', value: score },
        { name: 'Remaining', value: 100 - score }
    ];
    const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

    const getFilteredIssues = () => {
        let filtered = issues;

        // Filter by Tab
        if (filter !== 'ALL') {
             filtered = filtered.filter(i => {
                if (filter === 'CRITICAL') return i.severity === 'HIGH';
                if (filter === 'FORMATTING') return i.type === 'FORMATTING' || i.type === 'STRUCTURE';
                if (filter === 'GRAMMAR') return ['GRAMMAR', 'TONE', 'BANNED_WORD'].includes(i.type);
                return true;
            });
        }

        // Filter by Selected Section (if applicable)
        // Note: Assuming 'context' or 'type' might link to section, but we don't have explicit 'section' field in AuditIssue yet.
        // For now, we'll try to match vaguely if context contains section name, or just placeholder.
        // Since we don't have explicit linkage, clicking a section in the Sidebar will just act as a "Focus" intent visually for now
        // UNLESS we can infer it. 
        // TODO: Suggest to user to add 'section' field to AuditIssue for precise filtering.
        
        return filtered;
    };

    const filteredIssues = getFilteredIssues();
    const criticalCount = issues.filter(i => i.severity === 'HIGH').length;

  return (
    <div className="bg-slate-50 h-[calc(100vh-7rem)] w-full flex overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900 rounded-xl border border-slate-200">
        
        {/* Left Sidebar - Navigation & Outline */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 shadow-xl shadow-slate-200/50">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur-sm">
                <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors flex items-center gap-2 group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-semibold">Back to Editor</span>
                </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Document Structure</h3>
                    <RequiredSectionsList 
                        metadata={metadata} 
                        onSelectSection={setSelectedSection}
                        selectedSection={selectedSection}
                    />
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
                 <div className="bg-blue-600 rounded-xl p-4 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden group cursor-pointer"
                      onClick={() => { setChatQuery(undefined); setChatOpen(true); }}
                 >
                     <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                         <MessageCircle className="w-16 h-16" />
                     </div>
                     <h4 className="font-bold text-sm mb-1 relative z-10">Compliance Assistant</h4>
                     <p className="text-xs text-blue-100 relative z-10 mb-3">Ask about formatting rules & guidelines.</p>
                     <button className="text-[10px] bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1.5 w-fit">
                        Open Chat <ArrowLeft className="w-3 h-3 rotate-180" />
                     </button>
                 </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
            
            {/* Header / Hero */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative w-20 h-20 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={scoreData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={32}
                                        outerRadius={40}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={5}
                                        paddingAngle={5}
                                    >
                                        <Cell key="score" fill={scoreColor} />
                                        <Cell key="rem" fill="#f1f5f9" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className={`text-xl font-bold ${
                                    score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600'
                                }`}>{score}</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance Health</h1>
                            <p className="text-slate-500 text-sm mt-1">
                                {score >= 80 ? 'Your manuscript is looking great. Just a few tweaks.' : 
                                 score >= 60 ? 'Several issues need attention before submission.' : 
                                 'Critical formatting errors detected. Major revision needed.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                         <div className="flex gap-4 border-r border-slate-200 pr-6 mr-2">
                             <div className="flex flex-col items-end">
                                 <span className="text-2xl font-bold text-slate-900">{metadata?.pageCountEstimate || 0}</span>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pages</span>
                             </div>
                             <div className="flex flex-col items-end">
                                 <span className={`text-2xl font-bold ${criticalCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                     {criticalCount}
                                 </span>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical</span>
                             </div>
                         </div>
                         <button 
                            onClick={handleDownloadPdf}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-all shadow hover:shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Filters Row - Integrated into Header */}
                <div className="flex items-center gap-2 mt-8">
                     {[
                        { key: 'ALL', label: 'All Findings' },
                        { key: 'CRITICAL', label: 'Critical Issues' },
                        { key: 'FORMATTING', label: 'Formatting' },
                        { key: 'GRAMMAR', label: 'Grammar & Tone' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key as any)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-all border ${
                                filter === tab.key 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    
                    {selectedSection && (
                        <div className="ml-auto flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold animate-in fade-in slide-in-from-right-5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Focusing on: {selectedSection}
                            <button onClick={() => setSelectedSection(null)} className="ml-2 hover:bg-blue-100 rounded p-0.5">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Scrollable Issues Feed */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                
                {filteredIssues.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-60">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Clean Sheet!</h3>
                        <p className="text-slate-500 max-w-sm">
                            No issues found with the current filters. Great job following the guidelines.
                        </p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {filteredIssues.map((issue, idx) => (
                            <div 
                                key={idx} 
                                className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                            >
                                <div className="p-1 flex">
                                    {/* Severity Stripe */}
                                    <div className={`w-1.5 rounded-full my-1 ml-1 ${
                                        issue.severity === 'HIGH' ? 'bg-rose-500' : 
                                        issue.severity === 'MEDIUM' ? 'bg-amber-500' : 
                                        'bg-blue-500'
                                    }`}></div>

                                    <div className="flex-1 p-5 pl-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                                    issue.severity === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                    issue.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                    {issue.severity === 'HIGH' && <AlertOctagon className="w-3 h-3" />}
                                                    {issue.severity === 'MEDIUM' && <AlertTriangle className="w-3 h-3" />}
                                                    {issue.severity === 'LOW' && <Info className="w-3 h-3" />}
                                                    {issue.severity} Priority
                                                </span>
                                                <span className="text-slate-400 text-xs font-semibold">•</span>
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{issue.type.replace(/_/g, ' ')}</span>
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleExplainIssue(issue)}
                                                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                Why is this an error?
                                            </button>
                                        </div>

                                        <h5 className="text-slate-900 font-semibold mb-2">{issue.description}</h5>
                                        
                                        {issue.context && (
                                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 mb-4 font-mono text-sm relative">
                                                <Quote className="w-8 h-8 text-slate-200 absolute -top-3 -left-2 -z-10" />
                                                {renderHighlightedContext(issue.context, issue.description)}
                                            </div>
                                        )}

                                        {issue.suggestion && (
                                            <div className="flex items-center gap-3 pt-3 border-t border-slate-50 mt-2">
                                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-sm text-emerald-900 font-medium">
                                                    Suggestion: <span className="font-normal text-emerald-800">{issue.suggestion}</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Bottom padding to allow scrolling past FAB if needed */}
                <div className="h-24"></div>
            </div>
        </div>
      
      {/* Chat and FAB positioned via Portal */}
      {createPortal(
        <>
          <ComplianceChat 
            isOpen={chatOpen} 
            onClose={() => setChatOpen(false)} 
            contextData={JSON.stringify(issues)}
            initialQuery={chatQuery}
          />

          {!chatOpen && (
            <button
              onClick={() => { setChatQuery(undefined); setChatOpen(true); }}
              className="fixed bottom-6 right-8 z-100 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl hover:shadow-slate-900/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group border-2 border-slate-700/50"
              aria-label="Open Compliance Assistant"
            >
              <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />
            </button>
          )}
        </>,
        document.body
      )}
    </div>
  );
};

export default AnalysisReport;