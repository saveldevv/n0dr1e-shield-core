import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Zap, 
  Shield, 
  FolderOpen, 
  Play, 
  Square, 
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ScanState {
  isScanning: boolean;
  progress: number;
  scanType: 'quick' | 'full' | 'custom';
  customPath: string;
  filesScanned: number;
  threatsFound: number;
  currentFile: string;
  startTime?: Date;
}

export const ScanningInterface = () => {
  const { user, profile } = useAuth();
  const [scanState, setScanState] = useState<ScanState>({
    isScanning: false,
    progress: 0,
    scanType: 'quick',
    customPath: '',
    filesScanned: 0,
    threatsFound: 0,
    currentFile: ''
  });

  const startScan = async () => {
    if (!user) return;

    // Check subscription limits
    if (scanState.scanType === 'full' && profile?.subscription_tier === 'free') {
      toast({
        title: "Upgrade Required",
        description: "Full system scans require a Pro or Enterprise subscription.",
        variant: "destructive"
      });
      return;
    }

    setScanState(prev => ({
      ...prev,
      isScanning: true,
      progress: 0,
      filesScanned: 0,
      threatsFound: 0,
      startTime: new Date()
    }));

    try {
      // Create scan record in database
      const { data: scan, error } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          scan_type: scanState.scanType,
          scan_path: scanState.scanType === 'custom' ? scanState.customPath : null,
          status: 'running'
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate scanning process
      simulateScan(scan.id);
    } catch (error: any) {
      console.error('Error starting scan:', error);
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive"
      });
      setScanState(prev => ({ ...prev, isScanning: false }));
    }
  };

  const simulateScan = async (scanId: string) => {
    const totalFiles = scanState.scanType === 'quick' ? 1000 : 
                      scanState.scanType === 'full' ? 50000 : 5000;
    
    const mockFiles = [
      'C:\\Program Files\\App\\file1.exe',
      'C:\\Users\\Documents\\document.pdf',
      'C:\\Windows\\System32\\driver.sys',
      'C:\\Temp\\suspicious.tmp',
      'C:\\Downloads\\installer.exe'
    ];

    let currentProgress = 0;
    const increment = 100 / totalFiles;
    
    const scanInterval = setInterval(async () => {
      currentProgress += increment * (Math.random() * 50 + 25); // Variable speed
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(scanInterval);
        
        // Complete the scan
        const threatsFound = Math.floor(Math.random() * 3); // 0-2 threats
        
        setScanState(prev => ({
          ...prev,
          isScanning: false,
          progress: 100,
          filesScanned: totalFiles,
          threatsFound
        }));

        // Update database
        await supabase
          .from('scans')
          .update({
            status: 'completed',
            files_scanned: totalFiles,
            threats_found: threatsFound,
            completed_at: new Date().toISOString()
          })
          .eq('id', scanId);

        // Create mock threats if found
        if (threatsFound > 0) {
          const threats = Array.from({ length: threatsFound }, (_, i) => ({
            scan_id: scanId,
            user_id: user!.id,
            file_path: mockFiles[i % mockFiles.length],
            threat_name: `Threat.${Math.random().toString(36).substring(7)}`,
            threat_type: ['virus', 'malware', 'trojan'][Math.floor(Math.random() * 3)],
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
          }));

          await supabase.from('threats').insert(threats);
        }

        toast({
          title: "Scan Complete",
          description: `Scanned ${totalFiles.toLocaleString()} files. ${threatsFound} threats found.`,
          variant: threatsFound > 0 ? "destructive" : "default"
        });
      } else {
        setScanState(prev => ({
          ...prev,
          progress: Math.round(currentProgress),
          filesScanned: Math.round((currentProgress / 100) * totalFiles),
          currentFile: mockFiles[Math.floor(Math.random() * mockFiles.length)]
        }));
      }
    }, 100);
  };

  const stopScan = () => {
    setScanState(prev => ({
      ...prev,
      isScanning: false,
      progress: 0,
      filesScanned: 0,
      threatsFound: 0,
      currentFile: ''
    }));
    
    toast({
      title: "Scan Stopped",
      description: "The scan has been cancelled.",
    });
  };

  const getScanTypeIcon = (type: string) => {
    switch (type) {
      case 'quick':
        return <Zap className="h-5 w-5" />;
      case 'full':
        return <Shield className="h-5 w-5" />;
      case 'custom':
        return <FolderOpen className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scan Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Scan Type</Label>
            <RadioGroup 
              value={scanState.scanType} 
              onValueChange={(value: 'quick' | 'full' | 'custom') => 
                setScanState(prev => ({ ...prev, scanType: value }))
              }
              disabled={scanState.isScanning}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quick" id="quick" />
                <Label htmlFor="quick" className="flex items-center gap-2 cursor-pointer">
                  <Zap className="h-4 w-4 text-success" />
                  Quick Scan
                  <Badge variant="outline">Free</Badge>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="h-4 w-4 text-primary" />
                  Full System Scan
                  <Badge className="bg-warning text-warning-foreground">Pro+</Badge>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="flex items-center gap-2 cursor-pointer">
                  <FolderOpen className="h-4 w-4 text-accent" />
                  Custom Path Scan
                  <Badge variant="outline">Free</Badge>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Custom Path Input */}
          {scanState.scanType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customPath">Custom Path</Label>
              <Input
                id="customPath"
                value={scanState.customPath}
                onChange={(e) => setScanState(prev => ({ ...prev, customPath: e.target.value }))}
                placeholder="Enter folder path to scan..."
                disabled={scanState.isScanning}
              />
            </div>
          )}

          {/* Scan Controls */}
          <div className="flex gap-4">
            {!scanState.isScanning ? (
              <Button onClick={startScan} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Start Scan
              </Button>
            ) : (
              <Button onClick={stopScan} variant="destructive" className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Stop Scan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scan Progress */}
      {scanState.isScanning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getScanTypeIcon(scanState.scanType)}
              Scanning in Progress...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={scanState.progress} className="w-full" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{scanState.filesScanned.toLocaleString()} files scanned</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span>{scanState.threatsFound} threats found</span>
              </div>
            </div>
            
            {scanState.currentFile && (
              <p className="text-xs text-muted-foreground truncate">
                Currently scanning: {scanState.currentFile}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scan Results */}
      {!scanState.isScanning && scanState.progress === 100 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Scan Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {scanState.filesScanned.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Files Scanned</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${scanState.threatsFound > 0 ? 'text-destructive' : 'text-success'}`}>
                  {scanState.threatsFound}
                </div>
                <p className="text-sm text-muted-foreground">Threats Found</p>
              </div>
            </div>
            
            {scanState.threatsFound > 0 && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm font-medium text-destructive">
                  ⚠️ Threats detected! View the Threats tab to take action.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};