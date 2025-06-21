
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, MessageSquare, CheckCircle } from 'lucide-react';

interface PollAnalyticsProps {
  pollId: string;
}

// Mock data for analytics
const mockAnalyticsData = {
  keyMetrics: {
    totalVotes: 1247,
    totalParticipants: 384,
    consensusPoints: 3,
    consensusRate: 25,
    participationRate: 68
  },
  votingActivity: [
    { date: '2024-01-01', votes: 45 },
    { date: '2024-01-02', votes: 68 },
    { date: '2024-01-03', votes: 92 },
    { date: '2024-01-04', votes: 134 },
    { date: '2024-01-05', votes: 187 },
    { date: '2024-01-06', votes: 223 },
    { date: '2024-01-07', votes: 267 }
  ],
  statementEngagement: [
    { name: 'הצהרה 1', support: 75, oppose: 15, unsure: 10 },
    { name: 'הצהרה 2', support: 42, oppose: 48, unsure: 10 },
    { name: 'הצהרה 3', support: 68, oppose: 22, unsure: 10 },
    { name: 'הצהרה 4', support: 83, oppose: 12, unsure: 5 },
    { name: 'הצהרה 5', support: 34, oppose: 56, unsure: 10 }
  ],
  groupDistribution: [
    { name: 'קבוצה א', value: 35, color: '#8884d8' },
    { name: 'קבוצה ב', value: 28, color: '#82ca9d' },
    { name: 'קבוצה ג', value: 22, color: '#ffc658' },
    { name: 'קבוצה ד', value: 15, color: '#ff7300' }
  ]
};

export const PollAnalytics: React.FC<PollAnalyticsProps> = ({ pollId }) => {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{mockAnalyticsData.keyMetrics.totalParticipants}</p>
                <p className="text-sm text-muted-foreground hebrew-text">משתתפים</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{mockAnalyticsData.keyMetrics.totalVotes}</p>
                <p className="text-sm text-muted-foreground hebrew-text">הצבעות</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{mockAnalyticsData.keyMetrics.consensusPoints}</p>
                <p className="text-sm text-muted-foreground hebrew-text">נק' חיבור</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{mockAnalyticsData.keyMetrics.consensusRate}%</p>
                <p className="text-sm text-muted-foreground hebrew-text">אחוז הסכמה</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{mockAnalyticsData.keyMetrics.participationRate}%</p>
                <p className="text-sm text-muted-foreground hebrew-text">שיעור השתתפות</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voting Activity Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="hebrew-text">פעילות הצבעות לאורך זמן</CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d" className="hebrew-text">7 ימים</SelectItem>
                <SelectItem value="30d" className="hebrew-text">30 ימים</SelectItem>
                <SelectItem value="90d" className="hebrew-text">90 ימים</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockAnalyticsData.votingActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="votes" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statement Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="hebrew-text">מעורבות בהצהרות</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockAnalyticsData.statementEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="support" fill="#10b981" name="תמיכה" />
                <Bar dataKey="oppose" fill="#ef4444" name="התנגדות" />
                <Bar dataKey="unsure" fill="#f59e0b" name="לא בטוח" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="hebrew-text">התפלגות קבוצות</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockAnalyticsData.groupDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {mockAnalyticsData.groupDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Statements */}
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text">הצהרות מובילות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalyticsData.statementEngagement
              .sort((a, b) => b.support - a.support)
              .slice(0, 5)
              .map((statement, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium hebrew-text">{statement.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default" className="text-xs">
                        {statement.support}% תמיכה
                      </Badge>
                      <Badge variant="destructive" className="text-xs">
                        {statement.oppose}% התנגדות
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {statement.unsure}% לא בטוח
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{statement.support + statement.oppose + statement.unsure}</div>
                    <div className="text-sm text-muted-foreground hebrew-text">הצבעות</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
