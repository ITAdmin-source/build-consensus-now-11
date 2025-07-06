import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Check, X, Eye, AlertTriangle, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStatementsByPollId, submitUserStatement } from '@/integrations/supabase/statements';
import { fetchPendingStatements, approveStatement, rejectStatement } from '@/integrations/supabase/admin';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Statement } from '@/types/poll';

interface StatementsManagementProps {
  pollId: string;
}

export const StatementsManagement: React.FC<StatementsManagementProps> = ({ pollId }) => {
  const [newStatement, setNewStatement] = useState('');
  const [newStatementMoreInfo, setNewStatementMoreInfo] = useState('');
  const [newStatementType, setNewStatementType] = useState<'text' | 'image' | 'audio' | 'video'>('text');
  const [selectedStatements, setSelectedStatements] = useState<string[]>([]);
  const [editingStatement, setEditingStatement] = useState<Statement | null>(null);
  const [showApprovalQueue, setShowApprovalQueue] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  // Fetch approved statements for this poll
  const { data: statements = [], isLoading: statementsLoading } = useQuery({
    queryKey: ['statements', pollId],
    queryFn: () => fetchStatementsByPollId(pollId),
    enabled: !!pollId
  });

  // Fetch pending statements
  const { data: pendingStatementsData = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingStatements'],
    queryFn: fetchPendingStatements
  });

  // Filter pending statements for this poll - handle array safely
  const pendingStatements = Array.isArray(pendingStatementsData) 
    ? pendingStatementsData.filter(stmt => stmt.poll_id === pollId)
    : [];

  // Create statement mutation
  const createStatementMutation = useMutation({
    mutationFn: async (content: string) => {
      console.log('Creating statement:', { content, pollId, user: user?.id });
      
      if (!user) {
        throw new Error('User must be authenticated to create statements');
      }

      if (!isAdmin) {
        throw new Error('Only admins can create statements directly');
      }

      if (!content.trim()) {
        throw new Error('Statement content is required');
      }

      const { data, error } = await supabase
        .from('polis_statements')
        .insert({
          poll_id: pollId,
          content: content.trim(),
          more_info: newStatementMoreInfo.trim() || null,
          content_type: newStatementType,
          created_by_user_id: user.id,
          is_user_suggested: false,
          is_approved: true
        })
        .select();
      
      if (error) {
        console.error('Create statement error:', error);
        throw new Error(`Failed to create statement: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error('No statement was created');
      }
      
      console.log('Statement created successfully:', data[0]);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statements', pollId] });
      setNewStatement('');
      setNewStatementMoreInfo('');
      toast({
        title: 'הצהרה נוצרה',
        description: 'הצהרה חדשה נוספה לסקר',
      });
    },
    onError: (error) => {
      console.error('Create statement mutation error:', error);
      toast({
        title: 'שגיאה ביצירת הצהרה',
        description: error.message || 'אנא נסה שוב מאוחר יותר',
        variant: 'destructive'
      });
    }
  });

  // Approve statement mutation
  const approveStatementMutation = useMutation({
    mutationFn: (statementId: string) => {
      console.log('Approving statement:', statementId);
      return approveStatement(statementId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statements', pollId] });
      queryClient.invalidateQueries({ queryKey: ['pendingStatements'] });
      toast({
        title: 'הצהרה אושרה',
        description: 'הצהרה אושרה ותופיע בסקר',
      });
    },
    onError: (error) => {
      console.error('Approve statement error:', error);
      toast({
        title: 'שגיאה באישור הצהרה',
        description: 'אנא נסה שוב מאוחר יותר',
        variant: 'destructive'
      });
    }
  });

  // Reject statement mutation
  const rejectStatementMutation = useMutation({
    mutationFn: (statementId: string) => {
      console.log('Rejecting statement:', statementId);
      return rejectStatement(statementId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingStatements'] });
      toast({
        title: 'הצהרה נדחתה',
        description: 'הצהרה נמחקה מהסקר',
        variant: 'destructive'
      });
    },
    onError: (error) => {
      console.error('Reject statement error:', error);
      toast({
        title: 'שגיאה בדחיית הצהרה',
        description: 'אנא נסה שוב מאוחר יותר',
        variant: 'destructive'
      });
    }
  });

  // Delete statement mutation
  const deleteStatementMutation = useMutation({
    mutationFn: async (statementId: string) => {
      console.log('Deleting statement:', statementId);
      
      if (!user) {
        throw new Error('User must be authenticated to delete statements');
      }

      if (!isAdmin) {
        throw new Error('Only admins can delete statements');
      }

      const { error } = await supabase
        .from('polis_statements')
        .delete()
        .eq('statement_id', statementId);
      
      if (error) {
        console.error('Delete statement error:', error);
        throw new Error(`Failed to delete statement: ${error.message}`);
      }
      
      console.log('Statement deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statements', pollId] });
      toast({
        title: 'הצהרה נמחקה',
        description: 'הצהרה הוסרה מהסקר',
        variant: 'destructive'
      });
    },
    onError: (error) => {
      console.error('Delete statement mutation error:', error);
      toast({
        title: 'שגיאה במחיקת הצהרה',
        description: error.message || 'אנא נסה שוב מאוחר יותר',
        variant: 'destructive'
      });
    }
  });

  // Update statement mutation
  const updateStatementMutation = useMutation({
    mutationFn: async ({ statementId, content, moreInfo }: { statementId: string; content: string; moreInfo?: string }) => {
      console.log('Updating statement:', { statementId, content, moreInfo });
      
      if (!user) {
        throw new Error('User must be authenticated to update statements');
      }

      if (!isAdmin) {
        throw new Error('Only admins can update statements');
      }

      if (!content.trim()) {
        throw new Error('Statement content is required');
      }

      const { data, error } = await supabase
        .from('polis_statements')
        .update({ 
          content: content.trim(),
          more_info: moreInfo?.trim() || null
        })
        .eq('statement_id', statementId)
        .select();
      
      if (error) {
        console.error('Update statement error:', error);
        throw new Error(`Failed to update statement: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error('No statement was updated. Statement may not exist or you may not have permission to update it.');
      }
      
      console.log('Statement updated successfully:', data[0]);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statements', pollId] });
      setEditingStatement(null);
      toast({
        title: 'הצהרה עודכנה',
        description: 'השינויים נשמרו בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Update statement mutation error:', error);
      toast({
        title: 'שגיאה בעדכון הצהרה',
        description: error.message || 'אנא נסה שוב מאוחר יותר',
        variant: 'destructive'
      });
    }
  });

  const handleCreateStatement = () => {
    if (!newStatement.trim()) {
      toast({
        title: 'שגיאה',
        description: 'נא להזין תוכן להצהרה',
        variant: 'destructive'
      });
      return;
    }
    createStatementMutation.mutate(newStatement);
  };

  const handleApproveStatement = (statementId: string) => {
    approveStatementMutation.mutate(statementId);
  };

  const handleRejectStatement = (statementId: string) => {
    rejectStatementMutation.mutate(statementId);
  };

  const handleDeleteStatement = (statementId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק הצהרה זו?')) {
      deleteStatementMutation.mutate(statementId);
    }
  };

  const handleUpdateStatement = () => {
    if (!editingStatement) return;
    
    if (!editingStatement.content.trim()) {
      toast({
        title: 'שגיאה',
        description: 'נא להזין תוכן להצהרה',
        variant: 'destructive'
      });
      return;
    }
    
    updateStatementMutation.mutate({
      statementId: editingStatement.statement_id,
      content: editingStatement.content,
      moreInfo: editingStatement.more_info
    });
  };

  if (statementsLoading || pendingLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">רק מנהלים יכולים לנהל הצהרות</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text">יצירת הצהרה חדשה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <Select value={newStatementType} onValueChange={(value: any) => setNewStatementType(value)}>
                  <SelectTrigger className="hebrew-text">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text" className="hebrew-text">טקסט</SelectItem>
                    <SelectItem value="image" className="hebrew-text">תמונה</SelectItem>
                    <SelectItem value="audio" className="hebrew-text">שמע</SelectItem>
                    <SelectItem value="video" className="hebrew-text">וידאו</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Textarea
                  value={newStatement}
                  onChange={(e) => setNewStatement(e.target.value)}
                  placeholder="הקלד את תוכן הההצהרה..."
                  className="hebrew-text text-right"
                />
              </div>
              <div>
                <Button 
                  onClick={handleCreateStatement} 
                  className="w-full"
                  disabled={createStatementMutation.isPending || !newStatement.trim()}
                >
                  <Plus className="h-4 w-4 ml-1" />
                  {createStatementMutation.isPending ? 'מוסיף...' : 'הוסף הצהרה'}
                </Button>
              </div>
            </div>
            {/* More Info field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-text">
                מידע נוסף (אופציונלי)
              </label>
              <Textarea
                value={newStatementMoreInfo}
                onChange={(e) => setNewStatementMoreInfo(e.target.value)}
                placeholder="הוסף מידע נוסף שיעזור למשתתפים להחליט כיצד להצביע..."
                className="hebrew-text text-right min-h-[100px]"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1 hebrew-text">
                מידע זה יוצג למשתתפים בלחיצה על סמל המידע ליד ההצהרה
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Queue */}
      {pendingStatements.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="hebrew-text flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                תור אישורים ({pendingStatements.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApprovalQueue(!showApprovalQueue)}
              >
                {showApprovalQueue ? 'הסתר' : 'הצג'}
              </Button>
            </div>
          </CardHeader>
          {showApprovalQueue && (
            <CardContent>
              <div className="space-y-4">
                {pendingStatements.map((statement) => (
                  <div key={statement.statement_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="hebrew-text text-right">{statement.content}</p>
                      {statement.more_info && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border-r-4 border-blue-200">
                          <p className="text-xs font-medium text-blue-800 hebrew-text mb-1">מידע נוסף:</p>
                          <p className="text-sm text-blue-700 hebrew-text">{statement.more_info}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {statement.content_type === 'text' ? 'טקסט' : statement.content_type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">הצעת משתמש</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 mr-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproveStatement(statement.statement_id)}
                        disabled={approveStatementMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectStatement(statement.statement_id)}
                        disabled={rejectStatementMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Statements List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="hebrew-text">הצהרות מאושרות ({statements.length})</CardTitle>
            <div className="flex gap-2">
              {selectedStatements.length > 0 && (
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 ml-1" />
                  מחק נבחרים ({selectedStatements.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="hebrew-text text-right">תוכן</TableHead>
                <TableHead className="hebrew-text text-center">מידע נוסף</TableHead>
                <TableHead className="hebrew-text text-center">סוג</TableHead>
                <TableHead className="hebrew-text text-center">תמיכה</TableHead>
                <TableHead className="hebrew-text text-center">התנגדות</TableHead>
                <TableHead className="hebrew-text text-center">הצבעות</TableHead>
                <TableHead className="hebrew-text text-center">ניקוד</TableHead>
                <TableHead className="hebrew-text text-center">סטטוס</TableHead>
                <TableHead className="hebrew-text text-center">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statements.map((statement) => (
                <TableRow key={statement.statement_id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedStatements.includes(statement.statement_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStatements([...selectedStatements, statement.statement_id]);
                        } else {
                          setSelectedStatements(selectedStatements.filter(id => id !== statement.statement_id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="hebrew-text text-right max-w-xs">
                    <div className="truncate">{statement.content}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    {statement.more_info ? (
                      <Info className="h-4 w-4 text-blue-600 mx-auto" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {statement.content_type === 'text' ? 'טקסט' : statement.content_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{statement.support_pct || 0}%</TableCell>
                  <TableCell className="text-center">{statement.oppose_pct || 0}%</TableCell>
                  <TableCell className="text-center">{statement.total_votes || 0}</TableCell>
                  <TableCell className="text-center">{statement.score || 0}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center">
                      {statement.is_consensus_point && (
                        <Badge variant="default" className="text-xs">נק' חיבור</Badge>
                      )}
                      {statement.is_user_suggested && (
                        <Badge variant="secondary" className="text-xs">הצעת משתמש</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingStatement(statement)}
                        disabled={updateStatementMutation.isPending}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteStatement(statement.statement_id)}
                        disabled={deleteStatementMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Statement Dialog */}
      {editingStatement && (
        <Dialog open={!!editingStatement} onOpenChange={() => setEditingStatement(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="hebrew-text">עריכת הצהרה</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-text">תוכן ההצהרה</label>
                <Textarea
                  value={editingStatement.content}
                  onChange={(e) => setEditingStatement({
                    ...editingStatement,
                    content: e.target.value
                  })}
                  className="hebrew-text text-right"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 hebrew-text">מידע נוסף (אופציונלי)</label>
                <Textarea
                  value={editingStatement.more_info || ''}
                  onChange={(e) => setEditingStatement({
                    ...editingStatement,
                    more_info: e.target.value
                  })}
                  placeholder="הוסף מידע נוסף שיעזור למשתתפים להחליט כיצד להצביע..."
                  className="hebrew-text text-right min-h-[100px]"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1 hebrew-text">
                  מידע זה יוצג למשתתפים בלחיצה על סמל המידע ליד ההצהרה
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingStatement(null)}>
                  ביטול
                </Button>
                <Button 
                  onClick={handleUpdateStatement}
                  disabled={updateStatementMutation.isPending || !editingStatement.content.trim()}
                >
                  {updateStatementMutation.isPending ? 'שומר...' : 'שמור'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
