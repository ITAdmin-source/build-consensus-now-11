
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Rocket,
  Code,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

interface DeploymentStep {
  platform: string;
  url: string;
  icon: React.ReactNode;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  description: string;
  steps: string[];
}

export const DeploymentGuide: React.FC = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const deploymentOptions: DeploymentStep[] = [
    {
      platform: 'Railway',
      url: 'https://railway.app',
      icon: <Rocket className="h-5 w-5" />,
      difficulty: 'Easy',
      description: 'מומלץ - פלטפורמה פשוטה עם זיהוי אוטומטי של Docker',
      steps: [
        'היכנס ל-Railway.app והתחבר',
        'צור פרויקט חדש',
        'חבר את הריפוזיטורי שלך',
        'Railway יזהה את Dockerfile אוטומטית',
        'הוסף משתנה סביבה: CLUSTERING_TOKEN',
        'העתק את ה-URL הציבורי'
      ]
    },
    {
      platform: 'Render',
      url: 'https://render.com',
      icon: <Globe className="h-5 w-5" />,
      difficulty: 'Easy',
      description: 'פלטפורמה אמינה עם תמיכה מלאה ב-Docker',
      steps: [
        'היכנס ל-Render.com',
        'צור Web Service חדש',
        'חבר את הריפוזיטורי',
        'הגדר את פקודות ה-Build וה-Start',
        'הוסף משתנה סביבה: CLUSTERING_TOKEN',
        'העתק את ה-URL לאחר הפריסה'
      ]
    },
    {
      platform: 'Google Cloud Run',
      url: 'https://cloud.google.com/run',
      icon: <Code className="h-5 w-5" />,
      difficulty: 'Advanced',
      description: 'פתרון מתקדם עם יכולות סקלינג גבוהות',
      steps: [
        'התקן את Google Cloud SDK',
        'בנה את ה-Docker image',
        'העלה ל-Container Registry',
        'פרוס עם gcloud run deploy',
        'הגדר משתנה סביבה',
        'העתק את ה-URL הציבורי'
      ]
    }
  ];

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      toast.success(`${label} הועתק ללוח`);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      toast.error('שגיאה בהעתקת הטקסט');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 hebrew-text">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">מדריך פריסת מיקרו-שירות</h2>
        <Badge variant="outline" className="text-sm">
          <AlertCircle className="h-3 w-3 ml-1" />
          נדרש לקבצה
        </Badge>
      </div>

      <div className="grid gap-4">
        {deploymentOptions.map((option) => (
          <Card key={option.platform} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {option.icon}
                  {option.platform}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(option.difficulty)}>
                    {option.difficulty}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(option.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 ml-1" />
                    פתח
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium">שלבי הפריסה:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {option.steps.map((step, index) => (
                    <li key={index} className="text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>הגדרות לאחר הפריסה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">משתנה סביבה נדרש:</label>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded font-mono text-sm">
              <code>CLUSTERING_TOKEN=secure-token-123</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard('CLUSTERING_TOKEN=secure-token-123', 'משתנה סביבה')}
              >
                {copiedText === 'משתנה סביבה' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">נתיבי בדיקה:</label>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <code className="px-2 py-1 bg-gray-50 rounded">GET /health</code>
                <span className="text-muted-foreground">בדיקת תקינות השירות</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="px-2 py-1 bg-gray-50 rounded">POST /cluster</code>
                <span className="text-muted-foreground">נקודת הקיבוץ הראשית</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="px-2 py-1 bg-gray-50 rounded">GET /queue/status</code>
                <span className="text-muted-foreground">סטטוס תור העבודות</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">חשוב!</h4>
                <p className="text-sm text-blue-800 mt-1">
                  לאחר הפריסה, עדכן את הגדרות המערכת עם ה-URL החדש והטוקן.
                  לחץ על "בדוק חיבור" כדי לוודא שהשירות פועל כראוי.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
