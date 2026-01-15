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
    MessageCircle
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
        
        if (quotedTerms.length === 0) return <span className="text-slate-600">{context}</span>;

        const pattern = new RegExp(`(${quotedTerms.join('|')})`, 'gi');
        const parts = context.split(pattern);

        return (
            <span className="text-slate-600">
                {parts.map((part, i) => 
                    quotedTerms.some(term => term.toLowerCase() === part.toLowerCase()) ? (
                        <span key={i} className="bg-red-100 text-red-700 font-semibold px-1 rounded mx-0.5">
                            {part}
                        </span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    // Derived State for Pie Chart
    const scoreData = [
        { name: 'Score', value: score },
        { name: 'Remaining', value: 100 - score }
    ];
    const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

    const filteredIssues = issues.filter(i => {
        if (filter === 'ALL') return true;
        if (filter === 'CRITICAL') return i.severity === 'HIGH';
        if (filter === 'FORMATTING') return i.type === 'FORMATTING' || i.type === 'STRUCTURE';
        if (filter === 'GRAMMAR') return ['GRAMMAR', 'TONE', 'BANNED_WORD'].includes(i.type);
        return true;
    });

  return (
    <div className="bg-slate-50 min-h-screen p-6 space-y-6">
      <div className="max-w-[1400px] mx-auto animate-in fade-in duration-300 space-y-6">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Audit Report</h2>
                <p className="text-xs text-slate-500">Generated {new Date().toLocaleTimeString()}</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
             <button 
                onClick={() => { setChatQuery(undefined); setChatOpen(true); }}
                className="hidden md:flex px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors items-center gap-2"
            >
                <HelpCircle className="w-4 h-4" />
                Assistant
            </button>
            <button 
                onClick={handleDownloadPdf}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
            </button>
        </div>
      </div>

      {/* HUD / Score Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Score Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-between md:col-span-1 relative overflow-hidden">
              <div className="z-10">
                  <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Compliance Score</span>
                  <div className="flex items-baseline gap-1 mt-1">
                      <span className={`text-4xl font-extrabold ${
                          score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                          {score}
                      </span>
                      <span className="text-slate-400 font-medium">/ 100</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                      {score >= 80 ? 'Excellent work. Ready for submission.' : 
                       score >= 60 ? 'Needs review before submission.' : 
                       'Critical revisions required.'}
                  </p>
              </div>
              <div className="h-24 w-24 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={scoreData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={40}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell key="score" fill={scoreColor} />
                            <Cell key="rem" fill="#f1f5f9" />
                        </Pie>
                    </PieChart>
                 </ResponsiveContainer>
              </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2 text-slate-500">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">Est. Pages</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">{metadata?.pageCountEstimate || 0}</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2 text-slate-500">
                      <AlignLeft className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">Abstract Words</span>
                  </div>
                  <span className={`text-2xl font-bold ${
                      (metadata?.abstractWordCount || 0) >= 150 && (metadata?.abstractWordCount || 0) <= 250 
                      ? 'text-slate-900' 
                      : 'text-amber-600'
                  }`}>
                      {metadata?.abstractWordCount || 0}
                  </span>
              </div>
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2 text-slate-500">
                      <Hash className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">Total Issues</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">{issues.length}</span>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Feed */}
        <div className="lg:col-span-8 ">
            
            {/* Custom Tab Switcher */}
            <div className="bg-slate-100/50 p-1 rounded-lg inline-flex border border-slate-200">
                {[
                    { key: 'ALL', label: 'All Findings' },
                    { key: 'CRITICAL', label: 'Critical' },
                    { key: 'FORMATTING', label: 'Formatting' },
                    { key: 'GRAMMAR', label: 'Grammar & Tone' }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key as any)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                            filter === tab.key 
                            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div className="space-y-4">
                {filteredIssues.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                        <p className="font-medium text-slate-900">No issues found!</p>
                        <p className="text-sm">Your manuscript looks clean in this category.</p>
                    </div>
                ) : (
                    filteredIssues.map((issue, idx) => (
                        <div 
                            key={idx} 
                            className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md
                            ${issue.severity === 'HIGH' ? 'border-l-4 border-l-rose-500' : 
                              issue.severity === 'MEDIUM' ? 'border-l-4 border-l-amber-500' : 
                              'border-l-4 border-l-blue-500'}`}
                        >
                            <div className="p-5 flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {issue.severity === 'HIGH' ? <AlertOctagon className="w-4 h-4 text-rose-500" /> :
                                         issue.severity === 'MEDIUM' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
                                         <Info className="w-4 h-4 text-blue-500" />}
                                        <span className="font-bold text-slate-800 text-sm tracking-tight">{issue.type.replace(/_/g, ' ')}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                                        issue.severity === 'HIGH' ? 'bg-rose-50 text-rose-700' :
                                        issue.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                                    }`}>
                                        {issue.severity}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-600 mb-3">{issue.description}</p>
                                
                                {issue.context && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-3 relative group/quote">
                                        <Quote className="w-3 h-3 text-slate-300 absolute top-2 left-2" />
                                        <p className="text-xs font-mono text-slate-600 pl-4 leading-relaxed">
                                            {renderHighlightedContext(issue.context, issue.description)}
                                        </p>
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                                     {issue.suggestion ? (
                                        <div className="flex gap-2 items-center text-xs text-emerald-700 bg-emerald-50 px-2 py-1.5 rounded border border-emerald-100 max-w-[70%]">
                                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                                            <span className="font-medium truncate">{issue.suggestion}</span>
                                        </div>
                                     ) : <span></span>}

                                    <button 
                                        onClick={() => handleExplainIssue(issue)}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                                    >
                                        Explain Rule
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Right Sidebar - Sticky */}
        <div className="lg:col-span-4  sticky top-6">
             {/* Required Sections Card */}
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 max-h-[calc(100vh-120px)] overflow-y-auto">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Required Sections</h3>
                 <RequiredSectionsList metadata={metadata} />
             </div>

             {/* Help Card */}
             <div className="bg-gradient-to-br mt-8  from-slate-900 to-slate-800 rounded-xl shadow-lg p-6 text-white text-center">
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                     <HelpCircle className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="font-bold mb-2">Confused by the results?</h3>
                 <p className="text-sm text-slate-300 mb-6">Our AI assistant is trained on the exact university handbook guidelines.</p>
                 <button 
                    onClick={() => { setChatQuery(undefined); setChatOpen(true); }}
                    className="w-full py-2.5 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors"
                >
                    Chat with Compliance Officer
                 </button>
             </div>
        </div>
      </div>
      </div>
      
      {/* Chat and FAB positioned via Portal to ensure they break out of any containers */}
      {createPortal(
        <>
          <ComplianceChat 
            isOpen={chatOpen} 
            onClose={() => setChatOpen(false)} 
            contextData={JSON.stringify(issues)}
            initialQuery={chatQuery}
          />

          {/* Floating Action Button - Only shown when chat is closed */}
          {!chatOpen && (
            <button
              onClick={() => { setChatQuery(undefined); setChatOpen(true); }}
              className="fixed bottom-6 right-8 z-[100] w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
              aria-label="Open Compliance Assistant"
            >
              <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse border-2 border-white"></span>
            </button>
          )}
        </>,
        document.body
      )}
    </div>
  );
};

// Simple X icon component if not imported
const XCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
    </svg>
);

export default AnalysisReport;