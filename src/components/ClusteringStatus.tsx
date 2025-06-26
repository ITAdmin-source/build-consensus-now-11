
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { ClusteringJob } from '@/types/poll';
import { useClusteringEngine } from '@/hooks/useClusteringEngine';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface ClusteringStatusProps {
  pollId: string;
  clusteringJob: ClusteringJob | null;
  isRunning: boolean;
  className?: string;
}

export const ClusteringStatus: React.FC<ClusteringStatusProps> = ({
  pollId,
  clusteringJob,
  isRunning,
  className = ''
}) => {
  const { triggerClustering, isRunning: isTriggering } = useClusteringEngine({ pollId });

  const getStatusBadge = () => {
    if (!clusteringJob) {
      return (
        <Badge variant="outline" className="hebrew-text">
          <Brain className="h-3 w-3 ml-1" />
          לא רץ
        </Badge>
      );
    }

    switch (clusteringJob.status) {
      case 'running':
        return (
          <Badge className="bg-blue-500 text-white animate-pulse hebrew-text">
            <RefreshCw className="h-3 w-3 ml-1 animate-spin" />
            מעבד...
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-500 text-white hebrew-text">
            <CheckCircle className="h-3 w-3 ml-1" />
            הושלם
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="hebrew-text">
            <AlertCircle className="h-3 w-3 ml-1" />
            נכשל
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="hebrew-text">
            <Clock className="h-3 w-3 ml-1" />
            בהמתנה
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleTriggerClustering = async () => {
    try {
      await triggerClustering(false);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleForceReclustering = async () => {
    try {
      await triggerClustering(true);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const getLastRunText = () => {
    if (!clusteringJob?.completed_at && !clusteringJob?.created_at) return null;
    
    const date = clusteringJob.completed_at || clusteringJob.created_at;
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: he 
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="hebrew-text">סטטוס אלגוריתם הקבצה</span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {clusteringJob && (
          <div className="text-xs text-muted-foreground space-y-1">
            {clusteringJob.status === 'completed' && (
              <>
                <div className="flex justify-between">
                  <span>קבוצות שנוצרו:</span>
                  <span className="font-medium">{clusteringJob.groups_created || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>נקודות הסכמה:</span>
                  <span className="font-medium">{clusteringJob.consensus_points_found || 0}</span>
                </div>
                {clusteringJob.processing_time_ms && (
                  <div className="flex justify-between">
                    <span>זמן עיבוד:</span>
                    <span className="font-medium">{Math.round(clusteringJob.processing_time_ms / 1000)}s</span>
                  </div>
                )}
              </>
            )}
            
            {clusteringJob.status === 'failed' && clusteringJob.error_message && (
              <div className="text-red-600 text-xs">
                שגיאה: {clusteringJob.error_message}
              </div>
            )}
            
            {getLastRunText() && (
              <div className="text-xs text-muted-foreground">
                {clusteringJob.status === 'completed' ? 'הושלם' : 'נוצר'} {getLastRunText()}
              </div>
            )}
          </div>
        )}

        {isRunning && (
          <div className="space-y-2">
            <Progress value={undefined} className="h-2" />
            <p className="text-xs text-muted-foreground hebrew-text">
              מעבד נתונים ומבצע קבצה...
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={clusteringJob?.status === 'completed' ? 'outline' : 'default'}
            onClick={handleTriggerClustering}
            disabled={isRunning || isTriggering}
            className="flex-1 hebrew-text"
          >
            {isTriggering ? (
              <>
                <RefreshCw className="h-3 w-3 ml-1 animate-spin" />
                מפעיל...
              </>
            ) : (
              <>
                <Brain className="h-3 w-3 ml-1" />
                {clusteringJob?.status === 'completed' ? 'עדכן קבצה' : 'הפעל קבצה'}
              </>
            )}
          </Button>
          
          {clusteringJob?.status === 'completed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleForceReclustering}
              disabled={isRunning || isTriggering}
              className="hebrew-text"
            >
              <RefreshCw className="h-3 w-3 ml-1" />
              קבצה מחדש
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
