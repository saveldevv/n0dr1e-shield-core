import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ShieldCheck, Crown, Zap, Building } from 'lucide-react';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show dashboard if authenticated
  if (user) {
    return <Dashboard />;
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="flex items-center justify-center mb-8">
          <Shield className="h-16 w-16 text-primary mr-4" />
          <h1 className="text-6xl font-bold text-foreground">n0dr1e</h1>
        </div>
        
        <h2 className="text-3xl font-bold mb-6 text-foreground">
          Modern Antivirus Protection
        </h2>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Lightweight, cloud-connected antivirus that's easy to use, flexible with pricing, 
          and powerful enough to clean infections without bloat.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <a href="/auth">Get Started Free</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-12 text-foreground">
            Core Features
          </h3>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  Smart Scanning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Quick, full, and custom scans to detect threats at any level of depth.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Threat Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Quarantine or delete malicious files with advanced threat analysis.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-warning" />
                  Flexible Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Free basic protection, Pro real-time monitoring, Enterprise multi-device support.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-12 text-foreground">
            Choose Your Protection Level
          </h3>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  Free
                </CardTitle>
                <CardDescription className="text-2xl font-bold">$0/month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>✓ Basic on-demand scanning</p>
                <p>✓ Manual threat removal</p>
                <p>✓ Basic protection</p>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-warning" />
                  Pro
                </CardTitle>
                <CardDescription className="text-2xl font-bold">$7.99/month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>✓ Real-time protection</p>
                <p>✓ Automated scans</p>
                <p>✓ Advanced threat detection</p>
                <p>✓ Priority support</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Enterprise
                </CardTitle>
                <CardDescription className="text-2xl font-bold">$19.99/month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>✓ Multiple devices</p>
                <p>✓ Advanced reporting</p>
                <p>✓ Centralized management</p>
                <p>✓ 24/7 support</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4 text-primary-foreground">
            Ready to Secure Your System?
          </h3>
          <p className="text-primary-foreground/80 mb-8">
            Join thousands of users protecting their devices with n0dr1e.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href="/auth">Start Free Trial</a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
