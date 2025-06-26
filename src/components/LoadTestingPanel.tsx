
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Users, 
  Vote, 
  Target, 
  Clock, 
  BarChart3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoadTestConfig {
  numParticipants: number;
  votesPerParticipant: number;
  numStatements: number;
  batchSize: number;
  delayBetweenBatches: number;
}

interface LoadTestResults {
  totalVotes: number;
  totalTime: number;
  votesPerSecond: number;
  clusteringTime: number;
  groupsCreated: number;
  consensusPoints: number;
  errors: number;
}

export const LoadTestingPanel: React.FC<{ pollId: string }> = ({ pollId }) => {
  const [config, setConfig] = useState<LoadTestConfig>({
    numParticipants: 100,
    votesPerParticipant: 50,
    numStatements: 20,
    batchSize: 10,
    delayBetweenBatches: 100
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<LoadTestResults | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const generateTestVotes = async (statements: string[]) => {
    const votes = [];
    const voteValues = ['support', 'oppose', 'unsure'];
    
    for (let p = 0; p < config.numParticipants; p++) {
      const sessionId = `load_test_${Date.now()}_${p}`;
      
      for (let v = 0; v < config.votesPerParticipant; v++) {
        const statementId = statements[Math.floor(Math.random() * statements.length)];
        const voteValue = voteValues[Math.floor(Math.random() * voteValues.length)];
        
        votes.push({
          poll_id: pollId,
          statement_id: statementId,
          session_id: sessionId,
          vote_value: voteValue
        });
      }
    }
    
    return votes;
  };

  const runLoadTest = async () => {
    try {
      setIsRunning(true);
      setProgress(0);
      setResults(null);
      setLogs([]);
      
      addLog('מתחיל בדיקת עומס...');
      
      // Get statements for this poll
      const { data: statements, error: statementsError } = await supabase
        .from('polis_statements')
        .select('statement_id')
        .eq('poll_id', pollId)
        .eq('is_approved', true);
      
      if (statementsError || !statements || statements.length === 0) {
        throw new Error('לא נמצאו הצהרות מאושרות לסקר זה');
      }
      
      addLog(`נמצאו ${statements.length} הצהרות`);
      
      const startTime = Date.now();
      const statementIds = statements.map(s => s.statement_id);
      const testVotes = await generateTestVotes(statementIds);
      
      addLog(`נוצרו ${testVotes.length} הצבעות בדיקה`);
      
      // Insert votes in batches
      let insertedCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < testVotes.length; i += config.batchSize) {
        const batch = testVotes.slice(i, i + config.batchSize);
        
        try {
          const { error } = await supabase
            .from('polis_votes')
            .insert(batch);
          
          if (error) {
            console.error('Batch insert error:', error);
            errorCount += batch.length;
          } else {
            insertedCount += batch.length;
          }
        } catch (error) {
          console.error('Batch error:', error);
          errorCount += batch.length;
        }
        
        setProgress((insertedCount / testVotes.length) * 80); // 80% for voting
        
        if (config.delayBetweenBatches > 0) {
          await new Promise(resolve => setTimeout(resolve, config.delayBetweenBatches));
        }
        
        if (i % (config.batchSize * 10) === 0) {
          addLog(`הוכנסו ${insertedCount} הצבעות`);
        }
      }
      
      const votingEndTime = Date.now();
      addLog(`הושלמה הכנסת הצבעות: ${insertedCount} הצלחות, ${errorCount} שגיאות`);
      
      // Trigger clustering
      addLog('מפעיל אלגוריתם קבצה...');
      setProgress(85);
      
      const clusteringStartTime = Date.now();
      const { data: clusteringData, error: clusteringError } = await supabase.functions.invoke('clustering-engine', {
        body: {
          poll_id: pollId,
          force_recalculate: true
        }
      });
      
      const clusteringEndTime = Date.now();
      const totalTime = clusteringEndTime - startTime;
      const clusteringTime = clusteringEndTime - clusteringStartTime;
      
      if (clusteringError || !clusteringData?.success) {
        throw new Error(clusteringData?.error || 'שגיאה באלגוריתm הקבצה');
      }
      
      setProgress(100);
      
      const finalResults: LoadTestResults = {
        totalVotes: insertedCount,
        totalTime,
        votesPerSecond: insertedCount / (totalTime / 1000),
        clusteringTime,
        groupsCreated: clusteringData.groups_created || 0,
        consensusPoints: clusteringData.consensus_points_found || 0,
        errors: errorCount
      };
      
      setResults(finalResults);
      addLog(`בדיקת עומס הושלמה בהצלחה!`);
      
      toast.success('בדיקת עומס הושלמה בהצלחה');
      
    } catch (error) {
      console.error('Load test error:', error);
      addLog(`שגיאה: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
      toast.error('שגיאה בבדיקת עומס');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 hebrew-text">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            בדיקת עומס מתקדמת
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="participants">משתתפים</Label>
              <Input
                id="participants"
                type="number"
                value={config.numParticipants}
                onChange={(e) => setConfig(prev => ({ ...prev, numParticipants: parseInt(e.target.value) || 0 }))}
                disabled={isRunning}
              />
            </div>
            
            <div>
              <Label htmlFor="votes">הצבעות למשתתף</Label>
              <Input
                id="votes"
                type="number"
                value={config.votesPerParticipant}
                onChange={(e) => setConfig(prev => ({ ...prev, votesPerParticipant: parseInt(e.target.value) || 0 }))}
                disabled={isRunning}
              />
            </div>
            
            <div>
              <Label htmlFor="batch">גודל אצווה</Label>
              <Input
                id="batch"
                type="number"
                value={config.batchSize}
                onChange={(e) => setConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 1 }))}
                disabled={isRunning}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              סה"כ הצבעות: {(config.numParticipants * config.votesPerParticipant).toLocaleString()}
            </Badge>
            <Badge variant="outline">
              אצוות: {Math.ceil((config.numParticipants * config.votesPerParticipant) / config.batchSize)}
            </Badge>
          </div>
          
          <Button
            onClick={runLoadTest}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'רץ...' : 'הפעל בדיקת עומס'}
          </Button>
          
          {isRunning && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center">{Math.round(progress)}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              תוצאות בדיקת עומס
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <Vote className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-muted-foreground">הצבעות</p>
                <p className="text-2xl font-bold">{results.totalVotes.toLocaleString()}</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-green-50">
                <Clock className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-muted-foreground">זמן כולל</p>
                <p className="text-2xl font-bold">{Math.round(results.totalTime / 1000)}s</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <Zap className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <p className="text-sm text-muted-foreground">הצבעות/שנייה</p>
                <p className="text-2xl font-bold">{Math.round(results.votesPerSecond)}</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-orange-50">
                <Target className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-sm text-muted-foreground">זמן קבצה</p>
                <p className="text-2xl font-bold">{Math.round(results.clusteringTime / 1000)}s</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">קבוצות</p>
                <p className="text-xl font-bold">{results.groupsCreated}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">נק' הסכמה</p>
                <p className="text-xl font-bold">{results.consensusPoints}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">שגיאות</p>
                <p className={`text-xl font-bold ${results.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {results.errors}
                </p>
              </div>
            </div>
            
            {results.errors === 0 && results.votesPerSecond > 50 && (
              <div className="mt-4 p-3 rounded-lg bg-green-50 flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span>בדיקת העומס עברה בהצלחה! המערכת יכולה להתמודד עם עומס גבוה.</span>
              </div>
            )}
            
            {(results.errors > 0 || results.votesPerSecond < 50) && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-50 flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="h-5 w-5" />
                <span>יש לבדוק את ביצועי המערכת - קיימות שגיאות או ביצועים נמוכים.</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>לוג בדיקת עומס</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
