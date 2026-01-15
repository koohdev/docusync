import React, { useState, useEffect } from 'react';
import { Upload, Check, Loader2, CloudUpload, FileText, History, BookOpen, ChevronRight } from 'lucide-react';
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
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'error';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="px-8 py-6 max-w-[1400px] mx-auto min-h-[calc(100vh-64px)]">
            
            {/* When report is showing, we hide the sidebar to give the report full focus */}
            <div className={`flex flex-col ${!reportData ? 'lg:flex-row' : ''} gap-8`}>
                
                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    {!reportData && (
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-foreground">Compliance Check</h1>
                            <p className="text-muted-foreground mt-1">Upload your manuscript chapter or full draft for instant verification.</p>
                        </div>
                    )}

                    {!reportData ? (
                        <Card 
                            className={`border-2 border-dashed transition-all duration-200 ${
                                isDragOver 
                                    ? 'border-primary bg-primary/5 scale-[1.01]' 
                                    : 'border-border hover:border-primary/50 hover:bg-accent/30'
                            } ${isAnalyzing ? 'pointer-events-none' : 'cursor-pointer'}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <CardContent className="p-12 text-center relative">
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center gap-6 py-8">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                {analysisProgress}%
                                            </div>
                                        </div>
                                        <div className="space-y-3 w-full max-w-xs">
                                            <p className="font-semibold text-foreground">{uploadStatus}</p>
                                            <Progress value={analysisProgress} className="h-2" />
                                            <p className="text-sm text-muted-foreground">This may take a few seconds</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-200 ${
                                            isDragOver 
                                                ? 'bg-primary text-primary-foreground scale-110' 
                                                : 'bg-primary/10 text-primary'
                                        }`}>
                                            <CloudUpload className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">
                                            {isDragOver ? 'Drop your file here' : 'Upload Manuscript'}
                                        </h3>
                                        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                                            Drag and drop your <span className="font-medium">.DOCX</span> or <span className="font-medium">.PDF</span> file here, or click to browse.
                                        </p>
                                        <Button size="xl" className="shadow-lg shadow-primary/20">
                                            <Upload className="w-4 h-4" />
                                            Select File
                                        </Button>
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                            accept=".docx, .pdf" 
                                            onChange={handleFileUpload}
                                            disabled={isAnalyzing}
                                        />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <AnalysisReport 
                                score={reportData.score}
                                status={reportData.score > 80 ? ComplianceStatus.COMPLIANT : ComplianceStatus.NON_COMPLIANT}
                                issues={reportData.issues}
                                metadata={reportData.metadata}
                                onClose={() => setReportData(null)}
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar - Only visible when NO report is showing */}
                {!reportData && (
                    <div className="w-full lg:w-80 shrink-0 space-y-6">
                        {/* Quick Guide Card */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                    Quick Requirements
                                </CardTitle>
                                <CardDescription>DCT CCS Capstone standards</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[
                                    { label: 'Margins', value: '1.5" Left, 1.0" Right' },
                                    { label: 'Font', value: 'Times New Roman, 12pt' },
                                    { label: 'Abstract', value: '150-250 words' },
                                    { label: 'Spacing', value: 'Double-spaced' },
                                ].map((req, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{req.label}</span>
                                        <Badge variant="secondary" className="font-mono text-xs">
                                            {req.value}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* History List */}
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <History className="w-4 h-4 text-primary" />
                                        Recent Scans
                                    </CardTitle>
                                    {history.length > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                            {history.length}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {history.length === 0 ? (
                                    <div className="py-8 text-center px-6">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                            <FileText className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground text-sm">No scans yet</p>
                                        <p className="text-muted-foreground/60 text-xs mt-1">Upload a document to get started</p>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[280px]">
                                        <div className="px-2 pb-2">
                                            {history.slice(0, 10).map((item, idx) => (
                                                <React.Fragment key={item.id}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button 
                                                                onClick={() => handleViewHistoryItem(item)}
                                                                className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors group flex items-center justify-between"
                                                            >
                                                                <div className="min-w-0 flex-1 mr-3">
                                                                    <div className="text-sm font-medium text-foreground truncate">
                                                                        {item.fileName}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                                        {formatDate(item.date)}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant={getScoreVariant(item.score)} className="font-bold">
                                                                        {item.score}%
                                                                    </Badge>
                                                                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </div>
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left">
                                                            Click to view report
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    {idx < history.slice(0, 10).length - 1 && (
                                                        <Separator className="mx-3" />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardStudent;