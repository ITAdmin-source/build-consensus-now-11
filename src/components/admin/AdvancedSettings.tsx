
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Save, Bell, Shield, Database, Zap } from 'lucide-react';

interface AdvancedSettingsProps {
  pollId: string;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ pollId }) => {
  const { toast } = useToast();

  const handleSaveSettings = (section: string) => {
    toast({
      title: 'הגדרות נשמרו',
      description: `הגדרות ${section} עודכנו בהצלחה`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Algorithm Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text flex items-center gap-2">
            <Zap className="h-5 w-5" />
            הגדרות אלגוריתם
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="hebrew-text">אלגוריתם קיבוץ קבוצות</Label>
              <Select defaultValue="kmeans">
                <SelectTrigger className="hebrew-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kmeans" className="hebrew-text">K-Means</SelectItem>
                  <SelectItem value="hierarchical" className="hebrew-text">Hierarchical Clustering</SelectItem>
                  <SelectItem value="dbscan" className="hebrew-text">DBSCAN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="hebrew-text">מספר קבוצות מקסימלי</Label>
              <Input type="number" defaultValue="8" min="2" max="20" />
            </div>
            
            <div className="space-y-2">
              <Label className="hebrew-text">משקל חשיבות הצהרות</Label>
              <Select defaultValue="equal">
                <SelectTrigger className="hebrew-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal" className="hebrew-text">שווה לכל ההצהרות</SelectItem>
                  <SelectItem value="time-based" className="hebrew-text">לפי זמן יצירה</SelectItem>
                  <SelectItem value="votes-based" className="hebrew-text">לפי מספר הצבעות</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="hebrew-text">תדירות עדכון אלגוריתם (דקות)</Label>
              <Input type="number" defaultValue="15" min="1" max="60" />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="auto-clustering" defaultChecked />
            <Label htmlFor="auto-clustering" className="hebrew-text">עדכון אוטומטי של קיבוץ קבוצות</Label>
          </div>
          
          <Button onClick={() => handleSaveSettings('אלגוריתם')}>
            <Save className="h-4 w-4 ml-1" />
            שמור הגדרות אלגוריתם
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text flex items-center gap-2">
            <Bell className="h-5 w-5" />
            הגדרות התראות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="hebrew-text">התראה על נקודת חיבור חדשה</Label>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="hebrew-text">התראה על הגעה ליעד הצבעות</Label>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="hebrew-text">התראה על הצהרות ממתינות לאישור</Label>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="hebrew-text">דוח יומי על פעילות הסקר</Label>
              <Switch />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label className="hebrew-text">כתובות אימייל לקבלת התראות</Label>
            <Textarea 
              placeholder="admin@example.com, manager@example.com"
              className="hebrew-text text-right"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="hebrew-text">URL של Webhook</Label>
            <Input placeholder="https://yoursite.com/webhook" />
          </div>
          
          <Button onClick={() => handleSaveSettings('התראות')}>
            <Save className="h-4 w-4 ml-1" />
            שמור הגדרות התראות
          </Button>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text flex items-center gap-2">
            <Shield className="h-5 w-5" />
            בקרת גישה
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="hebrew-text">דרוש רישום משתמשים</Label>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="hebrew-text">הגבל משתמשים אנונימיים</Label>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="hebrew-text">אמת כתובות IP</Label>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="hebrew-text">מנע הצבעות כפולות</Label>
              <Switch defaultChecked />
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="hebrew-text">הגבלה גיאוגרפית</Label>
              <Select defaultValue="none">
                <SelectTrigger className="hebrew-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="hebrew-text">ללא הגבלה</SelectItem>
                  <SelectItem value="israel" className="hebrew-text">ישראל בלבד</SelectItem>
                  <SelectItem value="custom" className="hebrew-text">מותאם אישית</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="hebrew-text">מקסימום הצבעות ליום למשתמש</Label>
              <Input type="number" defaultValue="100" min="1" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="hebrew-text">רשימת IP חסומים</Label>
            <Textarea 
              placeholder="192.168.1.1, 10.0.0.1"
              className="text-left"
            />
          </div>
          
          <Button onClick={() => handleSaveSettings('בקרת גישה')}>
            <Save className="h-4 w-4 ml-1" />
            שמור הגדרות גישה
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text flex items-center gap-2">
            <Database className="h-5 w-5" />
            ניהול נתונים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="hebrew-text">גיבוי אוטומטי יומי</Label>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="hebrew-text">שמור היסטוריית שינויים</Label>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="hebrew-text">מחק נתונים ישנים אוטומטית</Label>
              <Switch />
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="hebrew-text">תדירות גיבוי (שעות)</Label>
              <Input type="number" defaultValue="24" min="1" max="168" />
            </div>
            
            <div className="space-y-2">
              <Label className="hebrew-text">שמור נתונים למשך (ימים)</Label>
              <Input type="number" defaultValue="365" min="30" />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              צור גיבוי עכשיו
            </Button>
            <Button variant="outline">
              ייצא נתונים
            </Button>
            <Button variant="destructive">
              מחק נתונים ישנים
            </Button>
          </div>
          
          <Button onClick={() => handleSaveSettings('ניהול נתונים')}>
            <Save className="h-4 w-4 ml-1" />
            שמור הגדרות נתונים
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
