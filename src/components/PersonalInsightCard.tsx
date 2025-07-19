import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Eye, ExternalLink } from 'lucide-react';
import { UserInsight } from '@/integrations/supabase/userInsights';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface PersonalInsightCardProps {
  insight: UserInsight;
}

export const PersonalInsightCard: React.FC<PersonalInsightCardProps> = ({ insight }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: he });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'closed':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'פעיל';
      case 'closed':
        return 'סגור';
      case 'draft':
        return 'טיוטה';
      default:
        return status;
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-right truncate">
              {insight.poll_title}
            </h3>
            <div className="flex items-center gap-2 mt-2 justify-end">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(insight.generated_at)}
              </span>
              <Badge variant={getStatusBadgeVariant(insight.poll_status)} className="text-xs">
                {getStatusText(insight.poll_status)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground text-right leading-relaxed mb-4">
          {truncateContent(insight.insight_content)}
        </p>
        
        <div className="flex gap-2 justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                קרא עוד
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-right text-xl">
                  תובנות אישיות: {insight.poll_title}
                </DialogTitle>
                <div className="flex items-center gap-2 justify-end pt-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(insight.generated_at)}
                  </span>
                  <Badge variant={getStatusBadgeVariant(insight.poll_status)}>
                    {getStatusText(insight.poll_status)}
                  </Badge>
                </div>
              </DialogHeader>
              
              <div className="mt-6 space-y-4">
                {insight.poll_description && (
                  <div>
                    <h4 className="font-medium text-right mb-2">תיאור הסקר:</h4>
                    <p className="text-sm text-muted-foreground text-right leading-relaxed">
                      {insight.poll_description}
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-right mb-2">התובנות שלך:</h4>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-foreground text-right leading-relaxed whitespace-pre-wrap">
                      {insight.insight_content}
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {insight.poll_slug && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => window.open(`/poll/${insight.poll_slug}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              לסקר
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};