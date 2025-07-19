import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalInsightCard } from './PersonalInsightCard';
import { useUserInsights } from '@/hooks/useUserInsights';
import { Loader2, Brain, Lightbulb } from 'lucide-react';

export const PersonalInsightsCollection: React.FC = () => {
  const { insights, loading, error } = useUserInsights();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Brain className="h-5 w-5" />
            תובנות אישיות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="mr-2">טוען תובנות...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Brain className="h-5 w-5" />
            תובנות אישיות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right">
          <Brain className="h-5 w-5" />
          תובנות אישיות
        </CardTitle>
        <p className="text-sm text-muted-foreground text-right mt-2">
          האוסף שלך של תובנות אישיות מסקרים שהשתתפת בהם
        </p>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              עדיין אין תובנות אישיות
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              השתתף בסקרים וקבל תובנות אישיות על דעותיך והעמדות שלך. 
              התובנות יישמרו כאן כזיכרונות מהמסע שלך.
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground text-center mb-6">
              {insights.length} תובנות אישיות נשמרו
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {insights.map((insight) => (
                <PersonalInsightCard key={insight.insight_id} insight={insight} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};