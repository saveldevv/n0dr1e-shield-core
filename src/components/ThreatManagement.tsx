import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Shield, 
  Trash2, 
  Archive, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  FileX
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Threat {
  id: string;
  file_path: string;
  threat_name: string;
  threat_type: string;
  severity: string;
  status: string;
  detected_at: string;
  resolved_at?: string;
  action_taken?: string;
}

export const ThreatManagement = () => {
  const { user } = useAuth();
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchThreats();
    }
  }, [user]);

  const fetchThreats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('threats')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false });

      if (error) throw error;
      setThreats(data || []);
    } catch (error: any) {
      console.error('Error fetching threats:', error);
      toast({
        title: "Error loading threats",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuarantine = async (threatId: string, filePath: string) => {
    try {
      // Update threat status
      const { error: threatError } = await supabase
        .from('threats')
        .update({ 
          status: 'quarantined',
          resolved_at: new Date().toISOString(),
          action_taken: 'File moved to quarantine'
        })
        .eq('id', threatId);

      if (threatError) throw threatError;

      // Add to quarantine table
      const { error: quarantineError } = await supabase
        .from('quarantine')
        .insert({
          threat_id: threatId,
          user_id: user!.id,
          original_path: filePath,
          quarantine_path: `/quarantine/${threatId}_${filePath.split('/').pop()}`,
          file_size: Math.floor(Math.random() * 1024000) // Mock file size
        });

      if (quarantineError) throw quarantineError;

      toast({
        title: "File Quarantined",
        description: "The threat has been safely isolated.",
        variant: "default"
      });

      fetchThreats();
    } catch (error: any) {
      console.error('Error quarantining threat:', error);
      toast({
        title: "Quarantine Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (threatId: string) => {
    try {
      const { error } = await supabase
        .from('threats')
        .update({ 
          status: 'deleted',
          resolved_at: new Date().toISOString(),
          action_taken: 'File permanently deleted'
        })
        .eq('id', threatId);

      if (error) throw error;

      toast({
        title: "File Deleted",
        description: "The threat has been permanently removed.",
        variant: "default"
      });

      fetchThreats();
    } catch (error: any) {
      console.error('Error deleting threat:', error);
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleIgnore = async (threatId: string) => {
    try {
      const { error } = await supabase
        .from('threats')
        .update({ 
          status: 'ignored',
          resolved_at: new Date().toISOString(),
          action_taken: 'User chose to ignore this threat'
        })
        .eq('id', threatId);

      if (error) throw error;

      toast({
        title: "Threat Ignored",
        description: "This threat will be ignored in future scans.",
        variant: "default"
      });

      fetchThreats();
    } catch (error: any) {
      console.error('Error ignoring threat:', error);
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-warning text-warning-foreground';
      case 'medium':
        return 'bg-secondary text-secondary-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'detected':
        return 'bg-destructive text-destructive-foreground';
      case 'quarantined':
        return 'bg-warning text-warning-foreground';
      case 'deleted':
        return 'bg-success text-success-foreground';
      case 'ignored':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'detected':
        return <AlertTriangle className="h-4 w-4" />;
      case 'quarantined':
        return <Archive className="h-4 w-4" />;
      case 'deleted':
        return <CheckCircle className="h-4 w-4" />;
      case 'ignored':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  const detectedThreats = threats.filter(t => t.status === 'detected');
  const resolvedThreats = threats.filter(t => t.status !== 'detected');

  return (
    <div className="space-y-6">
      {/* Active Threats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Active Threats ({detectedThreats.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {detectedThreats.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Shield className="h-12 w-12 text-success mb-4" />
              <h3 className="text-lg font-medium text-success mb-2">All Clear!</h3>
              <p className="text-muted-foreground">No active threats detected on your system.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Path</TableHead>
                  <TableHead>Threat</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detectedThreats.map((threat) => (
                  <TableRow key={threat.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {threat.file_path}
                    </TableCell>
                    <TableCell>{threat.threat_name}</TableCell>
                    <TableCell className="capitalize">{threat.threat_type}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(threat.severity)}>
                        {threat.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(threat.detected_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuarantine(threat.id, threat.file_path)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Threat</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the infected file. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(threat.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleIgnore(threat.id)}
                        >
                          <FileX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resolved Threats */}
      {resolvedThreats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Resolved Threats ({resolvedThreats.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Path</TableHead>
                  <TableHead>Threat</TableHead>
                  <TableHead>Action Taken</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resolved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolvedThreats.map((threat) => (
                  <TableRow key={threat.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {threat.file_path}
                    </TableCell>
                    <TableCell>{threat.threat_name}</TableCell>
                    <TableCell className="text-sm">{threat.action_taken}</TableCell>
                    <TableCell>
                      <Badge className={`flex items-center gap-1 ${getStatusColor(threat.status)}`}>
                        {getStatusIcon(threat.status)}
                        {threat.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {threat.resolved_at ? new Date(threat.resolved_at).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};