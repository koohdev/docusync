import React, { useState, useEffect } from 'react';
import { Upload, Check, Loader2, CloudUpload, FileText, History, BookOpen, ChevronRight, FileType, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { runFullComplianceCheck } from '../services/complianceEngine';
import { submissionStore } from '../services/submissionStore';
import AnalysisReport from './AnalysisReport';
import { AuditIssue, ComplianceStatus, Submission, ComplianceMetadata } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface ReportData {
    score: number;
    issues: AuditIssue[];
    metadata?: ComplianceMetadata;
}

const DashboardStudent: React.FC = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [history, setHistory] = useState<Submission[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        setHistory(submissionStore.getAll());
    }, [reportData]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        processFile(file);
        event.target.value = '';
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        const file = event.dataTransfer.files?.[0];
        if (file && (file.name.endsWith('.docx') || file.name.endsWith('.pdf'))) {
            processFile(file);
        }
    };

    const processFile = async (file: File) => {
        setUploadStatus('Reading manuscript...');
        setIsAnalyzing(true);
        setReportData(null);
        setAnalysisProgress(10);

        try {
            await new Promise(r => setTimeout(r, 400));
            setUploadStatus('Parsing document structure...');
            setAnalysisProgress(30);
            
            await new Promise(r => setTimeout(r, 400));
            setUploadStatus('Analyzing formatting & tone...');
            setAnalysisProgress(60);
            
            const result = await runFullComplianceCheck(file);
            setAnalysisProgress(90);
            
            await new Promise(r => setTimeout(r, 200));
            setUploadStatus('Generating report...');
            setAnalysisProgress(100);
            
            const newSubmission: Submission = {
                id: crypto.randomUUID(),
                fileName: file.name,
                studentName: 'Group Alpha',
                groupName: 'Group Alpha',
                date: new Date().toISOString(),
                score: result.score,
                status: result.score >= 80 ? ComplianceStatus.COMPLIANT : 
                        result.score >= 60 ? ComplianceStatus.REVIEW_REQUIRED : ComplianceStatus.NON_COMPLIANT,
                issues: result.issues,
                metadata: result.metadata
            };
            
            submissionStore.save(newSubmission);
            setReportData(result);
            
        } catch (error) {
            console.error(error);
            alert("Failed to process document.");
        } finally {
            setIsAnalyzing(false);
            setUploadStatus('');
            setAnalysisProgress(0);
        }
    };

    const handleViewHistoryItem = (submission: Submission) => {
        setReportData({
            score: submission.score,
            issues: submission.issues,
            metadata: submission.metadata
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getScoreVariant = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-rose-600 bg-rose-50 border-rose-200';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const GuidelinesCard = () => (
        <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-xl">
             <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                     <BookOpen className="w-5 h-5 text-blue-300" />
                 </div>
                 <div>
                     <h3 className="font-bold text-lg leading-tight">Quick Guide</h3>
                     <p className="text-xs text-slate-400">CCS Capstone Standards</p>
                 </div>
             </div>
             
             <div className="space-y-4">
                 {[
                      { label: 'Margins', value: '1.5" L, 1.0" R' },
                      { label: 'Font', value: 'Times New Roman, 12pt' },
                      { label: 'Spacing', value: 'Double-spaced' },
                      { label: 'Paper Size', value: 'Letter (8.5" x 11")' },
                  ].map((req, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm group cursor-default">
                          <span className="text-slate-300 group-hover:text-white transition-colors">{req.label}</span>
                          <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded text-blue-200 border border-white/5">
                              {req.value}
                          </span>
                      </div>
                  ))}
             </div>
             
             <div className="mt-6 pt-4 border-t border-white/10">
                 <button className="w-full text-xs font-semibold text-blue-300 hover:text-white transition-colors flex items-center justify-center gap-2">
                     View Full Guidelines <ArrowRight className="w-3 h-3" />
                 </button>
             </div>
        </div>
    );

    return (
        <div className="px-6 py-8 mx-auto max-w-400 min-h-[calc(100vh-64px)] font-sans">
            
            {/* If Report is Active, Show Full Width Report */}
            {reportData ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <AnalysisReport 
                        score={reportData.score}
                        status={reportData.score > 80 ? ComplianceStatus.COMPLIANT : ComplianceStatus.NON_COMPLIANT}
                        issues={reportData.issues}
                        metadata={reportData.metadata}
                        onClose={() => setReportData(null)}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Welcome & Upload */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Compliance Check</h1>
                            <p className="text-slate-500 mt-2 text-lg">
                                Ready to verify your manuscript? detailed scan against <span className="font-semibold text-slate-700">DCT CCS Guidelines</span>.
                            </p>
                        </div>

                        {/* Upload Card */}
                        <div 
                            className={`border-2 border-dashed rounded-2xl transition-all duration-300 relative overflow-hidden group
                            ${isDragOver 
                                ? 'border-blue-500 bg-blue-50/50 scale-[1.01] ring-4 ring-blue-500/10' 
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-sm hover:shadow-md'
                            } ${isAnalyzing ? 'pointer-events-none' : 'cursor-pointer'}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <div className="p-12 md:p-16 text-center relative z-10">
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center gap-8 py-4">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center shadow-inner">
                                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
                                                {analysisProgress}%
                                            </div>
                                        </div>
                                        <div className="space-y-4 w-full max-w-sm">
                                            <div>
                                                <p className="font-bold text-slate-900 text-lg mb-1">{uploadStatus}</p>
                                                <p className="text-sm text-slate-500">Comparing with 50+ formatting rules...</p>
                                            </div>
                                            <Progress value={analysisProgress} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-transform duration-300 shadow-xl shadow-blue-900/5 
                                            ${isDragOver ? 'bg-blue-600 text-white rotate-6 scale-110' : 'bg-white text-blue-600 border border-slate-100'}
                                        `}>
                                            <CloudUpload className="w-12 h-12" />
                                        </div>
                                        
                                        <h3 className="text-2xl font-bold text-slate-900 mb-3">
                                            {isDragOver ? 'Drop file to scan' : 'Upload Manuscript'}
                                        </h3>
                                        <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                                            Support for <span className="font-semibold text-slate-700">.DOCX</span> and <span className="font-semibold text-slate-700">.PDF</span> files. 
                                            Maximum file size 25MB.
                                        </p>

                                        <div className="flex items-center justify-center gap-4">
                                            <Button size="xl" className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all">
                                                <Upload className="w-4 h-4 mr-2" />
                                                Browse Files
                                            </Button>
                                        </div>

                                        <input 
                                            type="file" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                            accept=".docx, .pdf" 
                                            onChange={handleFileUpload}
                                            disabled={isAnalyzing}
                                        />
                                    </>
                                )}
                            </div>
                            
                            {/* Decorative Background Elements */}
                            {!isAnalyzing && (
                                <>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-emerald-500 to-blue-500 opacity-20"></div>
                                    <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                                    <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                                </>
                            )}
                        </div>

                         {/* Supported Features Grid */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: FileType, title: 'Smart Parsing', desc: 'Auto-detects chapters & sections' },
                                { icon: AlertCircle, title: 'Format Check', desc: 'Validates margins, font, & spacing' },
                                { icon: Check, title: 'Tone Analysis', desc: 'Ensures academic writing style' }
                            ].map((f, i) => (
                                <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl flex items-start gap-4 hover:border-slate-200 transition-colors">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                                        <f.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 text-sm">{f.title}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        <GuidelinesCard />

                        {/* Recent Activity Feed */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <History className="w-4 h-4 text-slate-500" />
                                    Recent Scans
                                </h3>
                                {history.length > 0 && <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{history.length}</span>}
                            </div>
                            
                            <div className="max-h-100 overflow-y-auto p-2 custom-scrollbar">
                                {history.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Clock className="w-5 h-5 text-slate-300" />
                                        </div>
                                        <p className="text-sm text-slate-400 font-medium">No history yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {history.map((item) => (
                                            <button 
                                                key={item.id}
                                                onClick={() => handleViewHistoryItem(item)}
                                                className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                     <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                         item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                                     }`}></div>
                                                     <div className="min-w-0">
                                                         <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                                                             {item.fileName}
                                                         </p>
                                                         <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                                                             {formatDate(item.date)}
                                                         </p>
                                                     </div>
                                                </div>
                                                
                                                <div className={`px-2 py-1 rounded text-xs font-bold border ${getScoreVariant(item.score)}`}>
                                                    {item.score}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardStudent;