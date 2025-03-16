import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Eye, 
  ArrowUpRight,
  DownloadCloud,
  Award
} from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

export const AnalyticsCard: React.FC = () => {
  const { state } = useSettings();
  const { settings } = state;
  const { analytics } = settings;
  
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Analytics & Performance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">View Count</h3>
              <Eye className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.viewCount.toLocaleString()}</p>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              8.2% vs last week
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
              <DownloadCloud className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.conversionRate}</p>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              3.1% vs last week
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Avg Order Value</h3>
              <Award className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.aov}</p>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              12.3% vs last week
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
