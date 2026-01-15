import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, MoreHorizontal, Users, CheckCircle, AlertTriangle, TrendingUp, Eye, FileText, Trash2 } from 'lucide-react';
import { StudentGroup, Submission, ComplianceStatus } from '../types';
import { submissionStore } from '../services/submissionStore';
import GroupDetailView from './GroupDetailView';
import { jsPDF } from 'jspdf';
import jspdfAutotable from 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const DashboardAdviser: React.FC = () => {
    const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        compliant: 0,
        review: 0,
        avgScore: 0
    });
    const [groups, setGroups] = useState<StudentGroup[]>([]);
    const [complianceData, setComplianceData] = useState<any[]>([]);
    const [statusPieData, setStatusPieData] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const allSubmissions = submissionStore.getAll();
        setSubmissions(allSubmissions);

        const compliantCount = allSubmissions.filter(s => s.status === ComplianceStatus.COMPLIANT).length;
        const reviewCount = allSubmissions.filter(s => s.status === ComplianceStatus.REVIEW_REQUIRED || s.status === ComplianceStatus.NON_COMPLIANT).length;
        const avgScore = allSubmissions.length > 0 
            ? Math.round(allSubmissions.reduce((acc, curr) => acc + curr.score, 0) / allSubmissions.length) 
            : 0;

        setStats({
            total: allSubmissions.length,
            compliant: compliantCount,
            review: reviewCount,
            avgScore
        });

        const groupMap = new Map<string, StudentGroup>();
        allSubmissions.forEach(sub => {
            if (!groupMap.has(sub.groupName)) {
                groupMap.set(sub.groupName, {
                    id: sub.groupName,
                    name: sub.groupName,
                    projectTitle: sub.fileName.split('.')[0].replace(/_/g, ' '),
                    members: [sub.studentName],
                    lastSubmission: 'Just now',
                    complianceRate: sub.score
                });
            } else {
                const g = groupMap.get(sub.groupName)!;
                g.complianceRate = sub.score;
            }
        });
        
        const groupList = Array.from(groupMap.values());
        setGroups(groupList);
        setComplianceData(groupList.slice(0, 5).map(g => ({ name: g.name.replace('Group ', ''), compliance: g.complianceRate })));
        setStatusPieData([
            { name: 'Compliant', value: compliantCount },
            { name: 'Review Needed', value: reviewCount },
            { name: 'Critical', value: allSubmissions.filter(s => s.score < 50).length }
        ]);

    }, []);

    const formatTimeAgo = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
            return `${Math.floor(diffInSeconds / 86400)}d ago`;
        } catch { return 'Unknown'; }
    };

    const handleExportReport = () => {
        const doc = new jsPDF();
        const autoTable = (jspdfAutotable as any).default || jspdfAutotable;
        doc.text("Faculty Compliance Overview", 14, 20);
        const tableData = submissions.map(sub => [sub.groupName, sub.fileName, new Date(sub.date).toLocaleDateString(), `${sub.score}%`, sub.status]);
        autoTable(doc, { startY: 30, head: [['Group', 'File', 'Date', 'Score', 'Status']], body: tableData });
        doc.save("faculty_overview.pdf");
    };

    const getScoreVariant = (score: number) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'error';
    };

    if (selectedGroup) {
        return <GroupDetailView group={selectedGroup} onBack={() => setSelectedGroup(null)} />;
    }

    const statCards = [
        { 
            label: 'Total Submissions', 
            value: stats.total, 
            icon: FileText,
            color: 'text-slate-700',
            bgColor: 'bg-slate-50',
            description: 'All time'
        },
        { 
            label: 'Compliant', 
            value: stats.compliant, 
            icon: CheckCircle,
            color: 'text-green-700',
            bgColor: 'bg-green-50',
            description: 'Score ≥ 80%'
        },
        { 
            label: 'Review Needed', 
            value: stats.review, 
            icon: AlertTriangle,
            color: 'text-amber-700',
            bgColor: 'bg-amber-50',
            description: 'Requires attention'
        },
        { 
            label: 'Average Score', 
            value: `${stats.avgScore}%`, 
            icon: TrendingUp,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            description: 'Across all groups'
        },
    ];

    const filteredSubmissions = submissions.filter(sub => 
        searchQuery === '' || 
        sub.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="px-8 py-6 md:py-8 max-w-[1400px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Faculty Overview</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Monitoring compliance for {groups.length} Capstone {groups.length === 1 ? 'Group' : 'Groups'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleExportReport}>
                        <Download className="w-4 h-4" />
                        Export PDF
                    </Button>
                    <Button>
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, idx) => (
                    <Card key={idx} className="overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        {stat.label}
                                    </p>
                                    <p className={`text-3xl font-bold ${stat.color}`}>
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.description}
                                    </p>
                                </div>
                                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Compliance Trends</CardTitle>
                        <CardDescription>Score distribution by group</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            {complianceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={complianceData} barSize={40}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                                            dy={10} 
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                                        />
                                        <RechartsTooltip 
                                            cursor={{fill: 'rgba(148, 163, 184, 0.1)'}}
                                            contentStyle={{
                                                borderRadius: '8px', 
                                                border: 'none', 
                                                boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
                                                backgroundColor: 'hsl(var(--background))'
                                            }} 
                                        />
                                        <Bar dataKey="compliance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Breakdown Pie */}
                <Card>
                    <CardHeader>
                        <CardTitle>Status Distribution</CardTitle>
                        <CardDescription>Current submission states</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="w-full h-48 relative">
                            {stats.total > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusPieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={75}
                                                paddingAngle={4}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {statusPieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <span className="block text-3xl font-bold text-foreground">{stats.total}</span>
                                            <span className="text-xs text-muted-foreground">Total</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No submissions
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4 mt-4 text-xs text-muted-foreground font-medium">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                Compliant
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                Review
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                Critical
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Submissions Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Recent Submissions</CardTitle>
                            <CardDescription>All student group submissions</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 sm:flex-none sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by group or file..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            {searchQuery && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setSearchQuery('')}
                                    className="text-muted-foreground"
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredSubmissions.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-7 h-7 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground font-medium">
                                {searchQuery ? 'No submissions match your search' : 'No submissions yet'}
                            </p>
                            <p className="text-muted-foreground/60 text-sm mt-1">
                                {searchQuery ? 'Try a different search term' : 'Student submissions will appear here'}
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="max-h-100">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Group</TableHead>
                                        <TableHead>File Name</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead className="w-12.5"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSubmissions.map((sub) => (
                                        <TableRow key={sub.id} className="group">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Users className="w-4 h-4 text-primary" />
                                                    </div>
                                                    {sub.groupName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="text-muted-foreground truncate max-w-50 block">
                                                            {sub.fileName}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{sub.fileName}</TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatTimeAgo(sub.date)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getScoreVariant(sub.score)}>
                                                    {sub.score}/100
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={() => setSelectedGroup(groups.find(g => g.name === sub.groupName) || null)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Download className="w-4 h-4" />
                                                            Download Report
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardAdviser;