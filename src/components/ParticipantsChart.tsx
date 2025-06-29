
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Group } from '@/types/poll';
import { Users } from 'lucide-react';

interface ParticipantsChartProps {
  groups: Group[];
}

export const ParticipantsChart: React.FC<ParticipantsChartProps> = ({ groups }) => {
  // Transform groups data into scatter plot data
  const scatterData = groups.flatMap((group) => {
    if (!group.opinion_space_coords) return [];
    
    return Object.entries(group.opinion_space_coords).map(([sessionId, coords]) => ({
      x: coords[0],
      y: coords[1],
      groupId: group.group_id,
      groupName: group.name,
      groupColor: group.color,
      sessionId: sessionId
    }));
  });

  // Chart configuration
  const chartConfig = {
    participants: {
      label: "משתתפים",
    },
  };

  if (scatterData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 hebrew-text">
            <Users className="h-5 w-5" />
            מרחב דעות - תצוגה דו-ממדית
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground hebrew-text">
            אין נתוני מיקום זמינים עדיין
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 hebrew-text">
          <Users className="h-5 w-5" />
          מרחב דעות - תצוגה דו-ממדית
        </CardTitle>
        <p className="text-sm text-muted-foreground hebrew-text">
          כל נקודה מייצגת משתתף במרחב הדעות. משתתפים עם דעות דומות מקובצים יחד.
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              data={scatterData}
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <XAxis 
                type="number" 
                dataKey="x" 
                name="ממד ראשון"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="ממד שני"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => [
                      `${props.payload.groupName}`,
                      `קבוצה`
                    ]}
                    labelFormatter={() => "משתתף"}
                  />
                }
              />
              <Scatter name="משתתפים" dataKey="y" fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.groupColor} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {groups.map((group) => (
            <div key={group.group_id} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              <span className="text-sm hebrew-text">
                {group.name} ({group.member_count})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
