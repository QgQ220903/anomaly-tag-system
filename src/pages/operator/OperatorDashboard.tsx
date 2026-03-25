// src/pages/operator/OperatorDashboard.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  XCircle, 
  Clock, 
  CheckCircle, 
  Tag,
  ChevronRight 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockTags } from '@/lib/mockData';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/types';

export const OperatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const myTags = mockTags.filter(tag => tag.createdBy === '1');
  
  // Stats calculations
  const openTags = myTags.filter(tag => tag.status === 'Open');
  const inProgressTags = myTags.filter(tag => tag.status === 'In Progress' || tag.status === 'Pending Parts');
  const resolvedThisWeek = myTags.filter(tag => {
    if (!tag.closedAt) return false;
    const closedDate = new Date(tag.closedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return closedDate >= weekAgo;
  });

  // Recent tags (last 6)
  const recentTags = [...myTags]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-bold">Report New Anomaly</h2>
              <p className="text-white/80 text-sm">Tap to report an issue on the production floor</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/create-tag')}
            className="bg-white text-orange-600 hover:bg-white/90 rounded-xl px-6 py-3 text-base font-medium shadow-lg"
          >
            Report Now →
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <XCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-2xl font-bold text-red-700">{openTags.length}</p>
                <p className="text-sm text-red-600">My Open Tags</p>
                <p className="text-xs text-red-500">Require attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Clock className="w-8 h-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-blue-700">{inProgressTags.length}</p>
                <p className="text-sm text-blue-600">In Progress</p>
                <p className="text-xs text-blue-500">Being worked on</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-2xl font-bold text-green-700">{resolvedThisWeek.length}</p>
                <p className="text-sm text-green-600">Resolved This Week</p>
                <p className="text-xs text-green-500">Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Recent Tags Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">My Recent Tags</h3>
          <Badge className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
            {myTags.length}
          </Badge>
        </div>

        {recentTags.length > 0 ? (
          <>
            {/* Table for recent tags */}
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left text-sm text-gray-600">
                      <th className="px-4 py-3 font-medium">Tag ID</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Machine</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Priority</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTags.map((tag) => (
                      <tr 
                        key={tag.id}
                        onClick={() => navigate(`/tag/${tag.id}`)}
                        className="border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-orange-600 hover:text-orange-700 font-medium">
                            {tag.tagId}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {tag.categoryName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {tag.machineName}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={STATUS_CONFIG[tag.status].bgColor}>
                            <span className={STATUS_CONFIG[tag.status].color}>
                              {tag.status}
                            </span>
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {tag.priority && (
                            <Badge className={PRIORITY_CONFIG[tag.priority].bgColor}>
                              <span className={PRIORITY_CONFIG[tag.priority].color}>
                                {tag.priority}
                              </span>
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {getRelativeTime(tag.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* View all link */}
            <div className="text-right">
              <Link 
                to="/my-tags" 
                className="inline-flex items-center gap-1 text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
              >
                View all my tags
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          // Empty State
          <div className="border rounded-lg bg-white py-12 text-center">
            <Tag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No anomaly tags yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Report your first issue using the button above
            </p>
          </div>
        )}
      </div>
    </div>
  );
};