
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'emerald';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700 bg-blue-50 text-blue-600',
    green: 'from-green-600 to-green-700 bg-green-50 text-green-600',
    purple: 'from-purple-600 to-purple-700 bg-purple-50 text-purple-600',
    emerald: 'from-emerald-600 to-emerald-700 bg-emerald-50 text-emerald-600',
  };

  const [gradientClasses, bgClasses, textClasses] = colorClasses[color].split(' ');

  return (
    <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`w-12 h-12 ${bgClasses} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${textClasses}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
