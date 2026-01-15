import React from 'react';
import { Sparkles, Zap, ArrowRight, Layout, CheckCircle2, FileCheck, Shield, BookOpenCheck } from 'lucide-react';
import { UserRole } from '../types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface LandingPageProps {
  onLogin: (role: UserRole) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Tone Analysis",
      desc: "Detects passive voice, marketing fluff, and non-academic phrasing instantly."
    },
    {
      icon: <Layout className="w-6 h-6" />,
      title: "Structure Check",
      desc: "Ensures all mandatory sections (Abstract, Approval Sheet, etc.) are present and ordered."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Feedback",
      desc: "Get actionable correction suggestions in real-time, right in your browser."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-450 mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">DocuSync</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </nav>
          <div className="flex gap-3">
            <Button 
              variant="ghost"
              onClick={() => onLogin(UserRole.STUDENT)}
            >
              Sign In
            </Button>
            <Button 
              variant="outline"
              onClick={() => onLogin(UserRole.ADVISER)}
            >
              Faculty Access
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-28 lg:pt-32 lg:pb-40 bg-linear-to-b from-background to-accent/20">
          {/* Subtle background decoration */}
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl -z-10 animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-primary/4 rounded-full blur-3xl -z-10 animate-pulse" style={{animationDuration: '6s'}}></div>
          
          <div className="max-w-450 mx-auto px-8 text-center">
            <Badge variant="secondary" className="mb-8 gap-2 px-4 py-2 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold">AI-Powered Tone Analysis</span>
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Automated compliance for <span className="text-primary bg-primary/10 px-3 py-1 rounded-xl inline-block">Capstone Manuscripts</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700">
              DocuSync verifies formatting, citation styles, and academic tone in seconds. Focus on your research, not the margins.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Button 
                size="xl"
                onClick={() => onLogin(UserRole.STUDENT)}
                className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Check Manuscript
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                size="xl"
              >
                View Guidelines
              </Button>
            </div>

            {/* UI Mockup / Visual */}
            <div className="mt-20 relative max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Card className="shadow-2xl overflow-hidden">
                {/* Window Controls */}
                <div className="h-11 bg-muted/50 border-b border-border flex items-center gap-2 px-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="ml-4 text-xs text-muted-foreground">chapter_1_introduction.docx</div>
                </div>
                
                <CardContent className="p-8 grid grid-cols-3 gap-8 text-left">
                  {/* Document Preview */}
                  <div className="col-span-2 space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    
                    {/* Error Highlight Card */}
                    <Card className="border-destructive/50 bg-destructive/5 mt-6">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                            <span className="text-destructive text-xs font-bold">!</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-destructive">Margin Violation</div>
                            <div className="text-xs text-destructive/80 mt-1">Left margin is 1.0". Required: 1.5".</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="h-4 bg-muted rounded w-2/3 mt-4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </div>
                  
                  {/* Score Panel */}
                  <Card className="bg-accent/50">
                    <CardContent className="p-6">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Compliance Score</div>
                      <div className="text-5xl font-bold text-foreground mb-6">85%</div>
                      <Separator className="mb-4" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> Structure
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> Typography
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground"></div> Citations
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="bg-accent/30 py-24 border-t border-border">
          <div className="max-w-450 mx-auto px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything you need for compliance
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                DocuSync automates the tedious parts of manuscript review so you can focus on what matters.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <Card 
                  key={i} 
                  className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                >
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 border-t border-border">
          <div className="max-w-450 mx-auto px-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">DCT CCS Compliant</span>
              </div>
              <Separator orientation="vertical" className="hidden md:block h-6" />
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">APA 7th Edition Support</span>
              </div>
              <Separator orientation="vertical" className="hidden md:block h-6" />
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Real-time Analysis</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-450 mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                <BookOpenCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-foreground">DocuSync</span>
            </div>
            <p className="text-muted-foreground text-sm">
              &copy; 2024 DocuSync. Built for DCT CCS Capstone compliance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;