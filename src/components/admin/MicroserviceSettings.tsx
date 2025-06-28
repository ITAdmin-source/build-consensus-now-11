import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Settings,
  Database,
  Link,
  Key,
  Rocket,
  HelpCircle
} from 'lucide-react';
import { getSystemSetting, updateSystemSetting } from '@/integrations/supabase/settings';
import { toast } from 'sonner';
import { DeploymentGuide } from './DeploymentGuide';

interface MicroserviceStatus {
  status: 'healthy' | 'unhealthy' | 'unknown';
  timestamp?: string;
  error?: string;
}

interface QueueStatus {
  queued_jobs: number;
  processing_jobs: number;
  queue: Array<{
    job_id: string;
    poll_id: string;
    priority: number;
    created_at: string;
  }>;
  processing: Array<{
    job_id: string;
    poll_id: string;
    status: string;
  }>;
}

export const MicroserviceSettings: React.FC = () => {
  const [serviceUrl, setServiceUrl] = useState('');
  const [serviceToken, setServiceToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<MicroserviceStatus>({ status: 'unknown' });
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [url, token] = await Promise.all([
        getSystemSetting('clustering_microservice_url'),
        getSystemSetting('clustering_microservice_token')
      ]);
      
      setServiceUrl(url || 'http://localhost:8000');
      setServiceToken(token || '');
      
      if (url) {
        await checkServiceHealth(url, token || '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('שגיאה בטעינת הגדרות המיקרו-שירות');
    } finally {
      setLoading(false);
    }
  };

  const checkServiceHealth = async (url?: string, token?: string) => {
    const checkUrl = url || serviceUrl;
    const checkToken = token || serviceToken;
    
    if (!checkUrl) return;

    setChecking(true);
    try {
      const response = await fetch(`${checkUrl}/health`);
      
      if (response.ok) {
        const data = await response.json();
        setStatus({
          status: 'healthy',
          timestamp: data.timestamp
        });
        
        // Also get queue status
        await getQueueStatus(checkUrl, checkToken);
      } else {
        setStatus({
          status: 'unhealthy',
          error: `HTTP ${response.status}`
        });
      }
    } catch (error) {
      setStatus({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    } finally {
      setChecking(false);
    }
  };

  const getQueueStatus = async (url: string, token: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${url}/queue/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQueueStatus(data);
      }
    } catch (error) {
      console.error('Error getting queue status:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateSystemSetting('clustering_microservice_url', serviceUrl),
        updateSystemSetting('clustering_microservice_token', serviceToken)
      ]);
      
      toast.success('הגדרות המיקרו-שירות נשמרו בהצלחה');
      
      // Check health after saving
      if (serviceUrl) {
        await checkServiceHealth();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('שגיאה בשמירת הגדרות המיקרו-שירות');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = () => {
    switch (status.status) {
      case 'healthy':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 ml-1" />פעיל</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 ml-1" />לא פעיל</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 ml-1" />לא ברור</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 hebrew-text">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Server className="h-6 w-6" />
          מיקרו-שירות קיבוץ
        </h2>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {status.status === 'unhealthy' && (
            <Badge variant="outline" className="text-orange-600">
              <HelpCircle className="h-3 w-3 ml-1" />
              נדרש פריסה
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="deployment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deployment">פריסה</TabsTrigger>
          <TabsTrigger value="config">הגדרות</TabsTrigger>
          <TabsTrigger value="status">סטטוס</TabsTrigger>
          <TabsTrigger value="queue">תור עבודות</TabsTrigger>
        </TabsList>

        <TabsContent value="deployment" className="space-y-4">
          <DeploymentGuide />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                הגדרות חיבור
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  כתובת השירות
                </Label>
                <Input
                  id="service-url"
                  value={serviceUrl}
                  onChange={(e) => setServiceUrl(e.target.value)}
                  placeholder="https://your-app.railway.app"
                  dir="ltr"
                />
                <p className="text-sm text-muted-foreground">
                  כתובת המיקרו-שירות המפוריס (לא localhost!)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-token" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  טוקן אימות
                </Label>
                <Input
                  id="service-token"
                  type="password"
                  value={serviceToken}
                  onChange={(e) => setServiceToken(e.target.value)}
                  placeholder="secure-token-123"
                  dir="ltr"
                />
                <p className="text-sm text-muted-foreground">
                  טוקן זהה למשתנה הסביבה CLUSTERING_TOKEN
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={saveSettings}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 ml-2" />
                  )}
                  שמור הגדרות
                </Button>
                
                <Button
                  onClick={() => checkServiceHealth()}
                  disabled={checking}
                  variant="outline"
                >
                  {checking ? (
                    <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Activity className="h-4 w-4 ml-2" />
                  )}
                  בדוק חיבור
                </Button>
              </div>

              {status.status === 'unhealthy' && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <Rocket className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900">נדרש פריסה</h4>
                      <p className="text-sm text-orange-800 mt-1">
                        המיקרו-שירות עדיין לא פרוס. עבור לטאב "פריסה" להתחלה.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                סטטוס השירות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">סטטוס:</span>
                  {getStatusBadge()}
                </div>
                
                {status.timestamp && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">עדכון אחרון:</span>
                    <p className="text-sm text-muted-foreground">
                      {new Date(status.timestamp).toLocaleString('he-IL')}
                    </p>
                  </div>
                )}
              </div>

              {status.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    <AlertCircle className="h-4 w-4 inline ml-1" />
                    שגיאה: {status.error}
                  </p>
                </div>
              )}

              {status.status === 'healthy' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    <CheckCircle className="h-4 w-4 inline ml-1" />
                    השירות פועל תקין ומוכן לעבודה
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                תור עבודות
              </CardTitle>
            </CardHeader>
            <CardContent>
              {queueStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {queueStatus.queued_jobs}
                      </div>
                      <div className="text-sm text-muted-foreground">בתור</div>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {queueStatus.processing_jobs}
                      </div>
                      <div className="text-sm text-muted-foreground">בעיבוד</div>
                    </div>
                  </div>

                  {queueStatus.queue.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">עבודות בתור:</h4>
                      {queueStatus.queue.slice(0, 5).map((job) => (
                        <div key={job.job_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Poll: {job.poll_id.slice(0, 8)}...</span>
                          <Badge variant="outline">עדיפות {job.priority}</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {queueStatus.processing.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">עבודות בעיבוד:</h4>
                      {queueStatus.processing.map((job) => (
                        <div key={job.job_id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                          <span className="text-sm">Poll: {job.poll_id.slice(0, 8)}...</span>
                          <Badge>{job.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>אין מידע על תור העבודות</p>
                  <p className="text-sm">בדוק שהטוקן מוגדר נכון</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
