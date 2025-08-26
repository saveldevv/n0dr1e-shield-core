import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  History, 
  Zap, 
  Shield, 
  FolderOpen,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Scan {
  id: string;
  scan_type: string;
  scan_path?: string;
  status: string;
  threats_found: number;
  files_scanned: number;
  started_at: string;
  completed_at?: string;
}

export const ScanHistory = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchScanHistory();
    }
  }, [user]);

  const fetchScanHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error: any) {
      console.error('Error fetching scan history:', error);
      toast({
        title: "Error loading scan history",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getScanTypeIcon = (type: string) => {
    switch (type) {
      case 'quick':
        return <Zap className="h-4 w-4 text-success" />;
      case 'full':
        return <Shield className="h-4 w-4 text-primary" />;
      case 'custom':
        return <FolderOpen className="h-4 w-4 text-accent" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'running':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      case 'running':
        return 'bg-warning text-warning-foreground';
      case 'pending':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffMins > 0) {
      return `${diffMins}m ${diffSecs % 60}s`;
    }
    return `${diffSecs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Scan History ({scans.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scans.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Scan History</h3>
              <p className="text-muted-foreground">
                Your scan history will appear here after you run your first scan.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Files Scanned</TableHead>
                  <TableHead>Threats Found</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getScanTypeIcon(scan.scan_type)}
                        <span className="capitalize">{scan.scan_type} Scan</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {scan.scan_path || (scan.scan_type === 'full' ? 'Full System' : 'Quick Locations')}
                    </TableCell>
                    <TableCell>
                      <Badge className={`flex items-center gap-1 ${getStatusColor(scan.status)}`}>
                        {getStatusIcon(scan.status)}
                        {scan.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {scan.files_scanned?.toLocaleString() || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {scan.threats_found > 0 && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                        <span className={scan.threats_found > 0 ? 'text-destructive font-medium' : ''}>
                          {scan.threats_found}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {scan.status === 'completed' || scan.status === 'failed' 
                        ? formatDuration(scan.started_at, scan.completed_at)
                        : scan.status === 'running' 
                          ? formatDuration(scan.started_at) + ' (running)'
                          : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {new Date(scan.started_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {scans.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {scans.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Scans</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">
                {scans.filter(s => s.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">
                {scans.reduce((sum, scan) => sum + (scan.threats_found || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Threats Found</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-accent">
                {scans.reduce((sum, scan) => sum + (scan.files_scanned || 0), 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Files Scanned</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};