import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Scan, 
  History, 
  Settings,
  Crown,
  Zap,
  Building,
  LogOut
} from 'lucide-react';
import { ScanningInterface } from './ScanningInterface';
import { ThreatManagement } from './ThreatManagement';
import { ScanHistory } from './ScanHistory';

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const getSubscriptionIcon = (tier: string) => {
    switch (tier) {
      case 'pro':
        return <Zap className="h-4 w-4" />;
      case 'enterprise':
        return <Building className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'bg-warning text-warning-foreground';
      case 'enterprise':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">n0dr1e</h1>
              <p className="text-sm text-muted-foreground">Antivirus Protection</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge className={`flex items-center gap-1 ${getSubscriptionColor(profile?.subscription_tier || 'free')}`}>
              {getSubscriptionIcon(profile?.subscription_tier || 'free')}
              {profile?.subscription_tier?.toUpperCase() || 'FREE'}
            </Badge>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {profile?.full_name || profile?.email || user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="threats" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Threats
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Protection Status */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Protection Status</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">Protected</div>
                  <p className="text-xs text-muted-foreground">
                    Your system is secure
                  </p>
                </CardContent>
              </Card>

              {/* Last Scan */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
                  <Scan className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Never</div>
                  <p className="text-xs text-muted-foreground">
                    Run your first scan
                  </p>
                </CardContent>
              </Card>

              {/* Threats Detected */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    All clear
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <Button 
                  className="h-20 flex flex-col gap-2" 
                  onClick={() => setActiveTab('scan')}
                >
                  <Zap className="h-6 w-6" />
                  Quick Scan
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setActiveTab('scan')}
                >
                  <Shield className="h-6 w-6" />
                  Full Scan
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setActiveTab('threats')}
                >
                  <ShieldAlert className="h-6 w-6" />
                  View Threats
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scan">
            <ScanningInterface />
          </TabsContent>

          <TabsContent value="threats">
            <ThreatManagement />
          </TabsContent>

          <TabsContent value="history">
            <ScanHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;