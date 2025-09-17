import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function SimpleChart({ listOfCourses = [] }) {
  // Simple test data
  const data = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 5000 },
    { name: "Apr", revenue: 4500 },
    { name: "May", revenue: 6000 },
    { name: "Jun", revenue: 5500 }
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Simple Revenue Chart</h1>
        <p className="text-gray-600 mt-2">Basic chart test</p>
      </div>

      <Card className="border-0 shadow-lg bg-white">
        <CardHeader>
          <CardTitle>Revenue Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
              {typeof BarChart !== 'undefined' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p>Chart component not available</p>
                    <p className="text-sm">Recharts may not be loaded properly</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white">
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Courses:</strong> {listOfCourses?.length || 0}</p>
            <p><strong>Chart Data:</strong> {JSON.stringify(data.slice(0, 2))}</p>
            <p><strong>BarChart Component:</strong> {BarChart ? 'Available' : 'Not Available'}</p>
            <p><strong>ResponsiveContainer:</strong> {ResponsiveContainer ? 'Available' : 'Not Available'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SimpleChart;
