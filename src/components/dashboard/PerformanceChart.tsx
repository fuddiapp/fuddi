import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PerformanceChartProps {
  data: {
    date: string;
    views: number;
    redemptions: number;
  }[];
  title: string;
  description?: string;
}

const PerformanceChart = ({ data, title, description }: PerformanceChartProps) => {
  const [dateRange, setDateRange] = React.useState('7d');

  // In a real app, this would filter data based on the selected date range
  // For now, we'll just return the same data
  const getFilteredData = () => {
    return data;
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:shadow-fuddi-purple/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">{title}</CardTitle>
            {description && <CardDescription className="text-gray-600 mt-1">{description}</CardDescription>}
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36 border-gray-200 focus:border-fuddi-purple focus:ring-fuddi-purple">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="h-80 p-4 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={getFilteredData()}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="views"
              stackId="1"
              stroke="#4F01A1"
              fill="#4F01A1"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="redemptions"
              stackId="1"
              stroke="#6a1cc1"
              fill="#6a1cc1"
              fillOpacity={0.4}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
