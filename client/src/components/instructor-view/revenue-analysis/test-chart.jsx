import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

function TestChart({ listOfCourses = [] }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    console.log("TestChart - listOfCourses:", listOfCourses);
    
    // Create simple test data
    const testData = [
      { name: "Jan", revenue: 4000, students: 24 },
      { name: "Feb", revenue: 3000, students: 13 },
      { name: "Mar", revenue: 5000, students: 20 },
      { name: "Apr", revenue: 4500, students: 18 },
      { name: "May", revenue: 6000, students: 28 },
      { name: "Jun", revenue: 5500, students: 25 }
    ];
    
    setChartData(testData);
  }, [listOfCourses]);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Test Revenue Charts</h1>
        <p className="text-gray-600 mt-2">Testing if charts are working</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Simple Bar Chart */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle>Revenue Test Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Simple Line Chart */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle>Students Test Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Info */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Chart Data Length:</strong> {chartData.length}</p>
            <p><strong>Courses Length:</strong> {listOfCourses?.length || 0}</p>
            <p><strong>Recharts Available:</strong> {typeof BarChart !== 'undefined' ? 'Yes' : 'No'}</p>
            <p><strong>ResponsiveContainer Available:</strong> {typeof ResponsiveContainer !== 'undefined' ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TestChart;
