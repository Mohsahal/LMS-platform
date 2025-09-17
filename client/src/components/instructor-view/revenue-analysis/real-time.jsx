import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Users,
  BookOpen,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Activity
} from "lucide-react";
import PropTypes from "prop-types";
import { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

function RealTimeRevenueAnalysis({ listOfCourses = [] }) {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [realTimeData, setRealTimeData] = useState([]);
  const [liveStats, setLiveStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    todayRevenue: 0,
    todayStudents: 0,
    lastEnrollment: null
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate random enrollment events
      if (Math.random() < 0.3) { // 30% chance every 2 seconds
        const randomCourse = listOfCourses[Math.floor(Math.random() * listOfCourses.length)];
        if (randomCourse) {
          const newEnrollment = {
            id: Date.now(),
            courseId: randomCourse._id,
            courseTitle: randomCourse.title,
            studentName: `Student ${Math.floor(Math.random() * 1000)}`,
            revenue: randomCourse.pricing || 0,
            timestamp: new Date(),
            type: 'enrollment'
          };
          
          setRealTimeData(prev => [newEnrollment, ...prev.slice(0, 49)]); // Keep last 50 events
          
          // Update live stats
          setLiveStats(prev => ({
            ...prev,
            totalRevenue: prev.totalRevenue + newEnrollment.revenue,
            totalStudents: prev.totalStudents + 1,
            todayRevenue: prev.todayRevenue + newEnrollment.revenue,
            todayStudents: prev.todayStudents + 1,
            lastEnrollment: newEnrollment
          }));
        }
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [listOfCourses]);

  // Calculate revenue data
  const revenueData = useMemo(() => {
    const safeCourses = Array.isArray(listOfCourses) ? listOfCourses : [];
    
    const courseRevenue = safeCourses.map(course => ({
      id: course._id || `course-${Math.random()}`,
      title: course.title || "Untitled Course",
      students: course.students?.length || 0,
      price: course.pricing || 0,
      revenue: (course.students?.length || 0) * (course.pricing || 0),
      createdAt: course.createdAt ? new Date(course.createdAt) : new Date(),
      category: course.category || "General"
    }));

    const totalRevenue = courseRevenue.reduce((sum, course) => sum + course.revenue, 0) + liveStats.totalRevenue;
    const totalStudents = courseRevenue.reduce((sum, course) => sum + course.students, 0) + liveStats.totalStudents;
    const averageRevenuePerStudent = totalStudents > 0 ? totalRevenue / totalStudents : 0;

    // Generate hourly data for the last 24 hours
    const hourlyData = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStr = hour.getHours().toString().padStart(2, '0') + ':00';
      
      // Simulate realistic hourly data with some randomness
      const baseRevenue = Math.floor(totalRevenue * 0.02) + Math.floor(Math.random() * 500);
      const baseStudents = Math.floor(totalStudents * 0.01) + Math.floor(Math.random() * 10);
      
      hourlyData.push({
        hour: hourStr,
        revenue: baseRevenue,
        students: baseStudents,
        courses: Math.floor(Math.random() * 3)
      });
    }

    // Generate daily data for the last 30 days
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const baseRevenue = Math.floor(totalRevenue * 0.05) + Math.floor(Math.random() * 2000);
      const baseStudents = Math.floor(totalStudents * 0.03) + Math.floor(Math.random() * 20);
      
      dailyData.push({
        day: dayStr,
        revenue: baseRevenue,
        students: baseStudents,
        courses: Math.floor(Math.random() * 5)
      });
    }

    // Course performance data
    const coursePerformance = courseRevenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Revenue by category
    const categoryRevenue = courseRevenue.reduce((acc, course) => {
      const category = course.category || "General";
      if (!acc[category]) {
        acc[category] = { revenue: 0, students: 0, courses: 0 };
      }
      acc[category].revenue += course.revenue || 0;
      acc[category].students += course.students || 0;
      acc[category].courses += 1;
      return acc;
    }, {});

    const categoryData = Object.entries(categoryRevenue).map(([name, value]) => ({
      name,
      value: value.revenue,
      students: value.students,
      courses: value.courses
    }));

    return {
      totalRevenue,
      totalStudents,
      averageRevenuePerStudent,
      courseRevenue,
      hourlyData,
      dailyData,
      coursePerformance,
      categoryData
    };
  }, [listOfCourses, liveStats]);

  // KPI Cards with real-time indicators
  const kpiCards = [
    {
      title: "Total Revenue",
      value: `$${revenueData.totalRevenue.toLocaleString()}`,
      change: 12.5,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      isLive: true,
      liveValue: `+$${liveStats.todayRevenue} today`
    },
    {
      title: "Total Students",
      value: revenueData.totalStudents.toLocaleString(),
      change: 8.3,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      isLive: true,
      liveValue: `+${liveStats.todayStudents} today`
    },
    {
      title: "Avg Revenue/Student",
      value: `$${revenueData.averageRevenuePerStudent.toFixed(2)}`,
      change: 5.2,
      icon: Target,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      title: "Active Courses",
      value: listOfCourses.length.toString(),
      change: 12.5,
      icon: BookOpen,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    }
  ];

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Real-Time Revenue Analysis
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-normal text-green-600">LIVE</span>
            </div>
          </h1>
          <p className="text-gray-600 mt-2">Live revenue tracking and student enrollment analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="hourly">Last 24 Hours</option>
            <option value="daily">Last 30 Days</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Live Activity Feed */}
      {liveStats.lastEnrollment && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  New Enrollment: {liveStats.lastEnrollment.studentName}
                </p>
                <p className="text-sm text-gray-600">
                  Enrolled in {liveStats.lastEnrollment.courseTitle} • +${liveStats.lastEnrollment.revenue}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {liveStats.lastEnrollment.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
                </div>
                <div className="flex items-center gap-2">
                  {kpi.isLive && (
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <Activity className="w-3 h-3" />
                      LIVE
                    </div>
                  )}
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    kpi.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.change >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(kpi.change).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
              <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
              {kpi.liveValue && (
                <p className="text-xs text-green-600 font-medium">{kpi.liveValue}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live Data
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Real-time Revenue Chart */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Live Revenue Stream
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={selectedPeriod === 'hourly' ? revenueData.hourlyData : revenueData.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={selectedPeriod === 'hourly' ? 'hour' : 'day'} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`$${value.toLocaleString()}`, 'Revenue']}
                      labelFormatter={(label) => `${selectedPeriod === 'hourly' ? 'Hour' : 'Day'}: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Live Student Enrollments */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Live Student Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedPeriod === 'hourly' ? revenueData.hourlyData : revenueData.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={selectedPeriod === 'hourly' ? 'hour' : 'day'} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, 'Students']}
                      labelFormatter={(label) => `${selectedPeriod === 'hourly' ? 'Hour' : 'Day'}: ${label}`}
                    />
                    <Bar dataKey="students" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Revenue vs Students Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? `$${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'Students'
                    ]}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Revenue ($)"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="students" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Students"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Top Performing Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.coursePerformance && revenueData.coursePerformance.length > 0 ? (
                  <>
                    <div className="mb-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData.coursePerformance.slice(0, 5)} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="title" type="category" width={120} />
                          <Tooltip 
                            formatter={(value, name) => [`$${value.toLocaleString()}`, 'Revenue']}
                            labelFormatter={(label) => `Course: ${label}`}
                          />
                          <Bar dataKey="revenue" fill="#8B5CF6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {revenueData.coursePerformance.map((course, index) => (
                      <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{course.title}</h4>
                            <p className="text-sm text-gray-600">{course.students} students • ${course.price}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">${course.revenue.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Revenue</div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <p>No course performance data available</p>
                    <p className="text-sm">Create courses to see performance metrics</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {realTimeData.slice(0, 10).map((event, index) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{event.studentName}</p>
                        <p className="text-sm text-gray-600">Enrolled in {event.courseTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+${event.revenue}</p>
                        <p className="text-xs text-gray-500">
                          {event.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {realTimeData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2" />
                      <p>No recent activity</p>
                      <p className="text-sm">Enrollments will appear here in real-time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Live Stats */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Live Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${liveStats.todayRevenue.toLocaleString()}
                    </div>
                    <p className="text-gray-600">Today's Revenue</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {liveStats.todayStudents}
                    </div>
                    <p className="text-gray-600">Today's Enrollments</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-800">Live Updates</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Revenue and enrollment data updates every 2 seconds with simulated real-time events.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

RealTimeRevenueAnalysis.propTypes = {
  listOfCourses: PropTypes.array,
};

export default RealTimeRevenueAnalysis;
