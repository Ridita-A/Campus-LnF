import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card.jsx";
import { Button } from "@/app/components/ui/button.jsx";
import { ArrowLeft, TrendingUp, MapPin, Activity, Clock, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export function FunStats({ onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pt-20 flex justify-center">
        <div className="text-center">
          <div className="size-16 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Crunching the numbers...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Process data for Trends (Grouping Sets)
  const monthlyTrends = stats.trends
    .filter(t => t.report_year !== 'All Years' && t.report_month !== 'All Months')
    .map(t => ({
      name: `${t.report_month}/${t.report_year}`,
      Lost: parseInt(t.lost_count),
      Found: parseInt(t.found_count)
    }))
    .sort((a, b) => {
        const [aM, aY] = a.name.split('/');
        const [bM, bY] = b.name.split('/');
        return (aY - bY) || (aM - bM);
    });

  // Process data for Top Locations (Rank)
  const topLocations = stats.topRank
    .filter(l => l.location_name)
    .sort((a, b) => parseInt(a.activity_rank) - parseInt(b.activity_rank))
    .slice(0, 10)
    .map(l => ({
      name: l.location_name,
      Lost: parseInt(l.lost_count),
      Found: parseInt(l.found_count),
      Total: parseInt(l.total_reports),
      Rank: parseInt(l.activity_rank)
    }));

  // Process data for Resolution Time (Window Function)
  const resolutionTimes = stats.resolution
    .filter(r => r.location_name)
    .sort((a, b) => parseFloat(a.avg_resolution_hours) - parseFloat(b.avg_resolution_hours))
    .map(r => ({
      name: r.location_name,
      Hours: parseFloat(r.avg_resolution_hours)
    }));

  // Process data for Global Activity (Cube) - hide 'archived'
  const statusActivity = stats.cube
    .filter(c => c.report_type === 'All Types' && c.status !== 'All Statuses' && c.status !== 'archived')
    .map(c => ({
      name: c.status,
      value: parseInt(c.total_count)
    }));

  const statusMap = {};
  stats.rollup.forEach(r => {
    if (r.status && r.request_type !== 'All Requests' && r.status !== 'All Statuses') {
      statusMap[r.status] = (statusMap[r.status] || 0) + parseInt(r.total_count);
    }
  });

  const requestsRollup = Object.keys(statusMap)
    .map(status => ({
      name: status,
      Total: statusMap[status]
    }))
    .sort((a, b) => b.Total - a.Total);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100 rounded-full">
              <ArrowLeft className="size-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2">
              <Activity className="size-6 text-blue-600" />
              Global Fun Stats
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Top KPI Cards (Summary from Cube) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 font-medium mb-1">Total Reports</p>
                            <h3 className="text-4xl font-bold">
                                {stats.cube.find(c => c.report_type === 'All Types' && c.status === 'All Statuses')?.total_count || 0}
                            </h3>
                        </div>
                        <Activity className="size-12 text-blue-200 opacity-80" />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 font-medium mb-1">Total Lost</p>
                            <h3 className="text-4xl font-bold">
                                {stats.cube.find(c => c.report_type === 'Lost' && c.status === 'All Statuses')?.total_count || 0}
                            </h3>
                        </div>
                        <TrendingUp className="size-12 text-red-200 opacity-80" />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl border-0">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 font-medium mb-1">Total Found</p>
                            <h3 className="text-4xl font-bold">
                                {stats.cube.find(c => c.report_type === 'Found' && c.status === 'All Statuses')?.total_count || 0}
                            </h3>
                        </div>
                        <MapPin className="size-12 text-green-200 opacity-80" />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Monthly Trends (Grouping Sets) */}
            <Card className="shadow-lg border-grat-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                        <TrendingUp className="size-5 text-indigo-500"/> Activity Trends (By Month)
                    </CardTitle>
                    <CardDescription>Lost vs Found reports over time</CardDescription>
                </CardHeader>
                <CardContent className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyTrends}>
                            <defs>
                                <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="Lost" stroke="#ef4444" fillOpacity={1} fill="url(#colorLost)" />
                            <Area type="monotone" dataKey="Found" stroke="#10b981" fillOpacity={1} fill="url(#colorFound)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top Locations (Rank) */}
            <Card className="shadow-lg border-gray-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                        <Trophy className="size-5 text-yellow-500"/> Most Active Locations
                    </CardTitle>
                    <CardDescription>Ranked by total reports</CardDescription>
                </CardHeader>
                <CardContent className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topLocations} layout="vertical" margin={{ left: 0, right: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 13 }} interval={0} />
                            <Tooltip cursor={{fill: '#f3f4f6'}}/>
                            <Legend />
                            <Bar dataKey="Total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Resolution Time (Window Function) */}
            <Card className="shadow-lg border-gray-200 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                        <Clock className="size-5 text-teal-500"/> Average Completion Time
                    </CardTitle>
                    <CardDescription>Hours taken from report creation to accepted claim/return</CardDescription>
                </CardHeader>
                <CardContent className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={resolutionTimes}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(val) => `${val}h`} />
                            <Tooltip cursor={{fill: '#f3f4f6'}} />
                            <Bar dataKey="Hours" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Rollup & Cube Summaries */}
            <Card className="shadow-lg border-gray-200">
                <CardHeader>
                    <CardTitle className="text-gray-800">Report Statuses</CardTitle>
                    <CardDescription>Overall report status distribution</CardDescription>
                </CardHeader>
                <CardContent className="h-68 w-full flex justify-center pb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusActivity}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {statusActivity.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="shadow-lg border-gray-200">
                <CardHeader>
                    <CardTitle className="text-gray-800">Request Outcomes</CardTitle>
                    <CardDescription>Proportion of Claims & Returns by status</CardDescription>
                </CardHeader>
                <CardContent className="h-68 w-full flex justify-center pb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={requestsRollup}
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                dataKey="Total"
                                fill="#8884d8"
                                label={({name}) => name}
                            >
                                {requestsRollup.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}
