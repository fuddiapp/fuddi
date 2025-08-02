import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, User } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({ title, value, icon, description, trend }: StatCardProps) => {
  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:shadow-fuddi-purple/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-fuddi-purple/10 to-fuddi-purple/20 flex items-center justify-center text-fuddi-purple group-hover:from-fuddi-purple/20 group-hover:to-fuddi-purple/30 transition-all duration-300">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            <span>
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
            <span className="ml-1 hidden sm:inline text-gray-500">vs período anterior</span>
            <span className="ml-1 sm:hidden text-gray-500">vs anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
