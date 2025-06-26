
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Database, 
  RefreshCw, 
  Zap,
  TrendingUp,
  Users,
  Target,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ClusteringJob, ClusteringMetric } from '@/types/poll';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface ClusteringStats {
  totalJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  avgProcessingTime: number;
  avgGroupsCreated: number;
  avgConsensusPoints: number;
  totalParticipants: number;
  totalVotes: number;
}

export const ClusteringDashboard: React.FC = () => {
  const [stats, setStats] = useState<ClusteringStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<ClusteringJob[]>([]);
  const [metrics, setMetrics] = useState<ClusteringMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [jobsResponse, metricsResponse] = await Promise.all([
        supabase
          .from('polis_clustering_jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('polis_clustering_metrics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      if (jobsResponse.error) throw jobsResponse.error;
      if (metricsResponse.error) throw metricsResponse.error;

      const jobs = jobsResponse.data as ClusteringJob[];
      const metricsData = metricsResponse.data as ClusteringMetric[];

      setRecentJobs(jobs);
      setMetrics(metricsData);

      // Calculate stats
      const completedJobs = jobs.filter(j => j.status === 'completed');
      const runningJobs = jobs.filter(j => j.status === 'running' || j.status === 'pending');
      const failedJobs = jobs.filter(j => j.status === 'failed');

      const avgProcessingTime = completedJobs.length > 0 
        ? completedJobs.reduce((sum, job) => sum + (job.processing_time_ms || 0), 0) / completedJobs.length
        : 0;

      const avgGroupsCreated = completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => sum + (job.groups_created || 0), 0) / completedJobs.length
        : 0;

      const avgConsensusPoints = completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => sum + (job.consensus_points_found || 0), 0) / completedJobs.length
        : 0;

      const totalParticipants = jobs.reduce((sum, job) => sum + job.total_participants, 0);
      const totalVotes = jobs.reduce((sum, job) => sum + job.total_votes, 0);

      setStats({
        totalJobs: jobs.length,
        runningJobs: runningJobs.length,
        completedJobs: completedJobs.length,
        failedJobs: failedJobs.length,
        avgProcessingTime,
        avgGroupsCreated,
        avgConsensusPoints,
        totalParticipants,
        totalVotes
      });
    } catch (error) {
      console.error('Error fetching clustering stats:', error);
      toast.error('שגיאה בטעינת נתוני הקבצה');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
  };

  const handleCleanupCache = async () => {
    try {
      const { error } = await supabase.rpc('cleanup_expired_cluster_cache');
      if (error) throw error;
      toast.success('מטמון הקבצה נוקה בהצלחה');
    } catch (error) {
      console.error('Error cleaning cache:', error);
      toast.error('שגיאה בניקוי המטמון');
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Set up real-time subscription for clustering jobs
    const channel = supabase
      .channel('clustering-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polis_clustering_jobs'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
        <h2 className="text-2xl font-bold">דשבורד קבצה מתקדם</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleCleanupCache}
            variant="outline"
            size="sm"
          >
            <Database className="h-4 w-4 ml-1" />
            נקה מטמון
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ml-1 ${refreshing ? 'animate-spin' : ''}`} />
            רענן
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">סה"כ עבודות</p>
                  <p className="text-2xl font-bold">{stats.totalJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">רצות כעת</p>
                  <p className="text-2xl font-bold">{stats.runningJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">זמן עיבוד ממוצע</p>
                  <p className="text-2xl font-bold">{Math.round(stats.avgProcessingTime / 1000)}s</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-consensus-500" />
                <div>
                  <p className="text-sm text-muted-foreground">נק' הסכמה ממוצעות</p>
                  <p className="text-2xl font-bold">{Math.round(stats.avgConsensusPoints * 10) / 10}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">עבודות אחרונות</TabsTrigger>
          <TabsTrigger value="metrics">מדדי ביצועים</TabsTrigger>
          <TabsTrigger value="performance">ניטור ביצועים</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>עבודות קבצה אחרונות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.job_id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'running' ? 'secondary' :
                        job.status === 'failed' ? 'destructive' : 'outline'
                      }
                    >
                      {job.status === 'completed' ? 'הושלם' :
                       job.status === 'running' ? 'רץ' :
                       job.status === 'failed' ? 'נכשל' : 'בהמתנה'}
                    </Badge>
                    
                    <div>
                      <p className="font-medium">
                        {job.total_participants} משתתפים, {job.total_votes} הצבעות
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: he })}
                      </p>
                    </div>
                  </div>

                  <div className="text-left">
                    {job.status === 'completed' && (
                      <div className="text-sm">
                        <p>{job.groups_created} קבוצות</p>
                        <p>{job.consensus_points_found} נק' הסכמה</p>
                        <p>{Math.round((job.processing_time_ms || 0) / 1000)}s</p>
                      </div>
                    )}
                    
                    {job.status === 'failed' && job.error_message && (
                      <p className="text-sm text-red-600 max-w-xs truncate">
                        {job.error_message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>מדדי אלגוריתם</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics
                  .filter(m => ['silhouette_score', 'cluster_balance', 'avg_cluster_size'].includes(m.metric_name))
                  .slice(0, 6)
                  .map((metric) => (
                  <div key={metric.metric_id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {metric.metric_name === 'silhouette_score' ? 'ציון סילואט' :
                         metric.metric_name === 'cluster_balance' ? 'איזון קבוצות' :
                         metric.metric_name === 'avg_cluster_size' ? 'גודל קבוצה ממוצע' :
                         metric.metric_name}
                      </span>
                      <span className="text-lg font-bold">
                        {Number(metric.metric_value).toFixed(2)}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(Number(metric.metric_value) * 100, 100)} 
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>ביצועים כלליים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats && (
                  <>
                    <div className="flex justify-between">
                      <span>משתתfים כולל:</span>
                      <span className="font-bold">{stats.totalParticipants.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>הצבעות כולל:</span>
                      <span className="font-bold">{stats.totalVotes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>קבוצות ממוצעות:</span>
                      <span className="font-bold">{Math.round(stats.avgGroupsCreated * 10) / 10}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>שיעור הצלחה:</span>
                      <span className="font-bold">
                        {stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>אזהרות מערכת</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.failedJobs > 0 && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{stats.failedJobs} עבודות נכשלו</span>
                    </div>
                  )}
                  
                  {stats?.runningJobs > 3 && (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <Clock className="h-4 w-4" />
                      <span>יותר מ-3 עבודות רצות במקביל</span>
                    </div>
                  )}
                  
                  {stats?.avgProcessingTime > 30000 && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>זמן עיבוד ממוצע גבוה (&gt;30s)</span>
                    </div>
                  )}

                  {(!stats?.failedJobs && !stats?.runningJobs && stats?.avgProcessingTime < 30000) && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Zap className="h-4 w-4" />
                      <span>המערכת פועלת באופן תקין</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
