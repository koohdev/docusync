import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import DashboardStudent from './components/DashboardStudent';
import DashboardAdviser from './components/DashboardAdviser';
import { UserRole } from './types';
import { LogOut, BookOpenCheck } from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from './components/ui/tooltip';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GUEST);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(UserRole.GUEST);
  };

  if (userRole === UserRole.GUEST) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Authenticated Navbar - Clean & Modern */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-450 px-8 mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">DocuSync</span>
            <Separator orientation="vertical" className="h-5 mx-1" />
            <Badge variant={userRole === UserRole.STUDENT ? 'secondary' : 'default'}>
              {userRole === UserRole.STUDENT ? 'Student' : 'Adviser'}
            </Badge>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <span className="hidden sm:inline mr-2">Sign Out</span>
                <LogOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sign out of DocuSync</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <main className="flex-1 bg-accent/30">
        {userRole === UserRole.STUDENT && <DashboardStudent />}
        {userRole === UserRole.ADVISER && <DashboardAdviser />}
      </main>
    </div>
  );
};

export default App;