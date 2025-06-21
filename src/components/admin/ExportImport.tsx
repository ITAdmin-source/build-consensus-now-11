
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, FileText, Database, Settings, Copy } from 'lucide-react';

interface ExportImportProps {
  pollId: string;
}

export const ExportImport: React.FC<ExportImportProps> = ({ pollId }) => {
  const [exportFormat, setExportFormat] = useState('json');
  const [importData, setImportData] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleExportData = async (type: string) => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fileName = `poll-${pollId}-${type}.${exportFormat}`;
      toast({
        title: 'ייצוא הושלם',
        description: `הקובץ ${fileName} נוצר בהצלחה`,
      });
    } catch (error) {
      toast({
        title: 'שגיאה בייצוא',
        description: 'לא ניתן לייצא את הנתונים',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    if (!importData.trim()) {
      toast({
        title: 'שגיאה',
        description: 'אנא הכנס נתונים לייבוא',
        variant: 'destructive'
      });
      return;
    }

    setIsImporting(true);
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'ייבוא הושלם',
        description: 'הנתונים יובאו בהצלחה לסקר',
      });
      setImportData('');
    } catch (error) {
      toast({
        title: 'שגיאה בייבוא',
        description: 'לא ניתן לייבא את הנתונים',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCreateTemplate = () => {
    toast({
      title: 'תבנית נוצרה',
      description: 'תבנית הסקר נשמרה בספריית התבניות',
    });
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text flex items-center gap-2">
            <Download className="h-5 w-5" />
            ייצוא נתונים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="hebrew-text">פורמט ייצוא</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="hebrew-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json" className="hebrew-text">JSON</SelectItem>
                  <SelectItem value="csv" className="hebrew-text">CSV</SelectItem>
                  <SelectItem value="excel" className="hebrew-text">Excel</SelectItem>
                  <SelectItem value="pdf" className="hebrew-text">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleExportData('complete')}
              disabled={isExporting}
              className="hebrew-text"
            >
              <Database className="h-4 w-4 ml-1" />
              {isExporting ? 'מייצא...' : 'כל הנתונים'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleExportData('statements')}
              disabled={isExporting}
              className="hebrew-text"
            >
              <FileText className="h-4 w-4 ml-1" />
              {isExporting ? 'מייצא...' : 'הצהרות בלבד'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleExportData('votes')}
              disabled={isExporting}
              className="hebrew-text"
            >
              <Database className="h-4 w-4 ml-1" />
              {isExporting ? 'מייצא...' : 'הצבעות בלבד'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleExportData('analytics')}
              disabled={isExporting}
              className="hebrew-text"
            >
              <Settings className="h-4 w-4 ml-1" />
              {isExporting ? 'מייצא...' : 'דוח אנליטי'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text flex items-center gap-2">
            <Upload className="h-5 w-5" />
            ייבוא נתונים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="hebrew-text">נתונים לייבוא (JSON/CSV)</Label>
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="הדבק כאן את הנתונים לייבוא..."
              className="min-h-[200px] text-left"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleImportData} disabled={isImporting}>
              <Upload className="h-4 w-4 ml-1" />
              {isImporting ? 'מייבא...' : 'ייבא נתונים'}
            </Button>
            
            <Button variant="outline" onClick={() => setImportData('')} disabled={isImporting}>
              נקה
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground hebrew-text">
            <p>• ניתן לייבא הצהרות חדשות, הצבעות או הגדרות סקר</p>
            <p>• הנתונים יעברו בדיקת תקינות לפני הייבוא</p>
            <p>• ייבוא הצבעות יחליף את הנתונים הקיימים</p>
          </div>
        </CardContent>
      </Card>

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text flex items-center gap-2">
            <Copy className="h-5 w-5" />
            ניהול תבניות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleCreateTemplate} className="hebrew-text">
              <Copy className="h-4 w-4 ml-1" />
              צור תבנית מהסקר הנוכחי
            </Button>
            
            <Button variant="outline" className="hebrew-text">
              <Download className="h-4 w-4 ml-1" />
              ייצא כתבנית
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground hebrew-text">
            <p>• תבניות מאפשרות לשמור הגדרות סקר לשימוש חוזר</p>
            <p>• ניתן לשתף תבניות עם מנהלים אחרים</p>
            <p>• תבניות כוללות הגדרות בסיסיות ומתקדמות</p>
          </div>
        </CardContent>
      </Card>

      {/* Backup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text flex items-center gap-2">
            <Database className="h-5 w-5" />
            גיבוי ושחזור
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="hebrew-text">
              <Database className="h-4 w-4 ml-1" />
              צור גיבוי מלא
            </Button>
            
            <Button variant="outline" className="hebrew-text">
              <Upload className="h-4 w-4 ml-1" />
              שחזר מגיבוי
            </Button>
            
            <Button variant="outline" className="hebrew-text">
              <Download className="h-4 w-4 ml-1" />
              הורד גיבויים
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label className="hebrew-text">גיבויים אוטומטיים</Label>
            <div className="text-sm text-muted-foreground hebrew-text">
              <p>• גיבוי יומי מתבצע אוטומטית בשעה 02:00</p>
              <p>• גיבויים נשמרים למשך 30 יום</p>
              <p>• ניתן לשחזר לכל נקודת זמן בעבר</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
