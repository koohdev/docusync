import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle, XCircle, MoreVertical, Send, ShieldCheck, Download, Clock, X } from 'lucide-react';
import { StudentGroup, AuditIssue } from '../types';
import { jsPDF } from 'jspdf';
import jspdfAutotable from 'jspdf-autotable';

interface GroupDetailViewProps {
    group: StudentGroup;
    onBack: () => void;
}

const GroupDetailView: React.FC<GroupDetailViewProps> = ({ group, onBack }) => {
    const [mockIssues] = useState<AuditIssue[]>([
        { id: '1', type: 'STRUCTURE', description: 'Missing "Approval Sheet" section.', severity: 'HIGH' },
        { id: '2', type: 'FORMATTING', description: 'Left margin is 1.0". Required: 1.5".', severity: 'HIGH', suggestion: 'Adjust layout settings.' },
        { id: '3', type: 'BANNED_WORD', description: 'Found "powerful" in Abstract.', severity: 'MEDIUM', suggestion: 'Use "robust" or "effective".' },
        { id: '4', type: 'GRAMMAR', description: 'Passive voice in Chapter 1 intro.', severity: 'LOW' }
    ]);

    const [status, setStatus] = useState<'pending' | 'approved' | 'revision'>('pending');
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState('');

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        doc.text(`Audit: ${group.name}`, 10, 10);
        doc.save("audit.pdf");
    };

    const submitRevisionRequest = () => {
        setStatus('revision');
        setShowFeedbackModal(false);
        alert(`Request sent: ${feedback}`);
        setFeedback('');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 font-sans relative">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">{group.name}</h2>
                        <p className="text-sm text-slate-500">{group.projectTitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                     <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${
                        status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                        status === 'revision' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                     }`}>
                        {status}
                     </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 ">
                {/* Score Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-semibold text-slate-900">Compliance Status</h3>
                            <div className="text-3xl font-bold text-slate-900">{group.complianceRate}%</div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 mb-6">
                            <div 
                                className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                                style={{ width: `${group.complianceRate}%` }}
                            ></div>
                        </div>
                        <div className="flex gap-3">
                             <button 
                                onClick={handleDownloadPdf}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <Download className="w-4 h-4" /> Download Report
                             </button>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => setStatus('approved')}
                                className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <ShieldCheck className="w-4 h-4" /> Approve
                            </button>
                            <button 
                                onClick={() => setShowFeedbackModal(true)}
                                className="w-full py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" /> Request Changes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Issues Feed */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-900">Audit Log</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {mockIssues.map((issue) => (
                            <div key={issue.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-4">
                                <div className="mt-1 shrink-0">
                                    {issue.severity === 'HIGH' ? <XCircle className="w-5 h-5 text-red-500" /> : 
                                     issue.severity === 'MEDIUM' ? <AlertCircle className="w-5 h-5 text-amber-500" /> : 
                                     <AlertCircle className="w-5 h-5 text-blue-500" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-semibold text-slate-900">{issue.type.replace('_', ' ')}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            issue.severity === 'HIGH' ? 'bg-red-50 text-red-700' :
                                            issue.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                                        }`}>{issue.severity}</span>
                                    </div>
                                    <p className="text-sm text-slate-600">{issue.description}</p>
                                    {issue.suggestion && (
                                        <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                                            <span className="font-semibold">Suggestion:</span> {issue.suggestion}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">Request Revisions</h3>
                            <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <textarea 
                                className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none mb-4"
                                placeholder="Enter your feedback here..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            ></textarea>
                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => setShowFeedbackModal(false)}
                                    className="px-4 py-2 text-slate-500 hover:text-slate-900 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={submitRevisionRequest}
                                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium shadow-sm"
                                >
                                    Send Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDetailView;