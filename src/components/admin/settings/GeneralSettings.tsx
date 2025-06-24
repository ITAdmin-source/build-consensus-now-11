
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSystemSetting, updateSystemSetting } from '@/integrations/supabase/settings';

interface GeneralSettingsProps {
  initialMinStatements: number;
  onMinStatementsChange: (value: number) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  initialMinStatements,
  onMinStatementsChange
}) => {
  const { toast } = useToast();
  const [minStatements, setMinStatements] = useState(initialMinStatements);
  const [saving, setSaving] = useState(false);

  const handleSaveMinStatements = async () => {
    try {
      setSaving(true);
      await updateSystemSetting('min_statements_per_poll', minStatements.toString());
      onMinStatementsChange(minStatements);
      toast({
        title: 'הגדרות נשמרו',
        description: `מינימום הצהרות לסקר עודכן ל-${minStatements}`,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'שגיאה בשמירת ההגדרות',
        description: 'אנא נסה שוב',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          הגדרות מערכת כלליות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="min-statements">מינימום הצהרות לסקר חדש</Label>
          <div className="flex items-center gap-2">
            <Input
              id="min-statements"
              type="number"
              value={minStatements}
              onChange={(e) => setMinStatements(Number(e.target.value))}
              min={1}
              max={50}
              className="w-32"
            />
            <Button 
              onClick={handleSaveMinStatements} 
              size="sm"
              disabled={saving}
            >
              <Save className="h-4 w-4 ml-1" />
              {saving ? 'שומר...' : 'שמור'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            מספר ההצהרות המינימלי הנדרש ליצירת סקר חדש
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
