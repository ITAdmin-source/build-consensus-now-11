
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Check, X, Eye, AlertTriangle } from 'lucide-react';
import type { Statement } from '@/types/poll';

// Mock statements data
const mockStatements: Statement[] = [
  {
    statement_id: '1',
    poll_id: '1',
    content_type: 'text',
    content: 'יש להגדיל את התקציב לחינוך בישראל',
    is_user_suggested: false,
    is_approved: true,
    is_consensus_point: true,
    support_pct: 75,
    oppose_pct: 15,
    unsure_pct: 10,
    total_votes: 234,
    score: 95
  },
  {
    statement_id: '2',
    poll_id: '1',
    content_type: 'text',
    content: 'חובה לכלול תכנות בתכנית הלימודים',
    is_user_suggested: true,
    is_approved: false,
    is_consensus_point: false,
    support_pct: 0,
    oppose_pct: 0,
    unsure_pct: 0,
    total_votes: 0,
    score: 0
  }
];

interface StatementsManagementProps {
  pollId: string;
}

export const StatementsManagement: React.FC<StatementsManagementProps> = ({ pollId }) => {
  const [statements, setStatements] = useState<Statement[]>(mockStatements);
  const [newStatement, setNewStatement] = useState('');
  const [newStatementType, setNewStatementType] = useState<'text' | 'image' | 'audio' | 'video'>('text');
  const [selectedStatements, setSelectedStatements] = useState<string[]>([]);
  const [editingStatement, setEditingStatement] = useState<Statement | null>(null);
  const [showApprovalQueue, setShowApprovalQueue] = useState(false);
  const { toast } = useToast();

  const handleCreateStatement = () => {
    if (!newStatement.trim()) return;
    
    const statement: Statement = {
      statement_id: Date.now().toString(),
      poll_id: pollId,
      content_type: newStatementType,
      content: newStatement,
      is_user_suggested: false,
      is_approved: true,
      is_consensus_point: false,
      support_pct: 0,
      oppose_pct: 0,
      unsure_pct: 0,
      total_votes: 0,
      score: 0
    };
    
    setStatements([...statements, statement]);
    setNewStatement('');
    toast({
      title: 'הצהרה נוצרה',
      description: 'הצהרה חדשה נוספה לסקר',
    });
  };

  const handleApproveStatement = (statementId: string) => {
    setStatements(statements.map(stmt => 
      stmt.statement_id === statementId 
        ? { ...stmt, is_approved: true }
        : stmt
    ));
    toast({
      title: 'הצהרה אושרה',
      description: 'הצהרה אושרה ותופיע בסקר',
    });
  };

  const handleRejectStatement = (statementId: string) => {
    setStatements(statements.filter(stmt => stmt.statement_id !== statementId));
    toast({
      title: 'הצהרה נדחתה',
      description: 'הצהרה נמחקה מהסקר',
      variant: 'destructive'
    });
  };

  const handleDeleteStatement = (statementId: string) => {
    setStatements(statements.filter(stmt => stmt.statement_id !== statementId));
    toast({
      title: 'הצהרה נמחקה',
      description: 'הצהרה הוסרה מהסקר',
      variant: 'destructive'
    });
  };

  const handleToggleConsensusPoint = (statementId: string) => {
    setStatements(statements.map(stmt => 
      stmt.statement_id === statementId 
        ? { ...stmt, is_consensus_point: !stmt.is_consensus_point }
        : stmt
    ));
  };

  const approvedStatements = statements.filter(stmt => stmt.is_approved);
  const pendingStatements = statements.filter(stmt => !stmt.is_approved);

  return (
    <div className="space-y-6">
      {/* Create New Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text">יצירת הצהרה חדשה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Button onClick={handleCreateStatement} className="w-full">
                <Plus className="h-4 w-4 ml-1" />
                הוסף הצהרה
              </Button>
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
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectStatement(statement.statement_id)}
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
            <CardTitle className="hebrew-text">הצהרות מאושרות ({approvedStatements.length})</CardTitle>
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
              {approvedStatements.map((statement) => (
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
                    <Badge variant="outline" className="text-xs">
                      {statement.content_type === 'text' ? 'טקסט' : statement.content_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{statement.support_pct}%</TableCell>
                  <TableCell className="text-center">{statement.oppose_pct}%</TableCell>
                  <TableCell className="text-center">{statement.total_votes}</TableCell>
                  <TableCell className="text-center">{statement.score}</TableCell>
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
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={statement.is_consensus_point ? "default" : "outline"}
                        onClick={() => handleToggleConsensusPoint(statement.statement_id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteStatement(statement.statement_id)}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="hebrew-text">עריכת הצהרה</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={editingStatement.content}
                onChange={(e) => setEditingStatement({
                  ...editingStatement,
                  content: e.target.value
                })}
                className="hebrew-text text-right"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingStatement(null)}>
                  ביטול
                </Button>
                <Button onClick={() => {
                  setStatements(statements.map(stmt => 
                    stmt.statement_id === editingStatement.statement_id ? editingStatement : stmt
                  ));
                  setEditingStatement(null);
                  toast({
                    title: 'הצהרה עודכנה',
                    description: 'השינויים נשמרו בהצלחה',
                  });
                }}>
                  שמור
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
