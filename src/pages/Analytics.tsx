
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore, Customer, CustomerData } from "@/stores/dashboardStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

const Analytics = () => {
  const { customers, taskResult } = useDashboardStore();
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  
  // Prepare chart data when customers or task result changes
  useEffect(() => {
    if (customers.length && taskResult?.data) {
      // Map customer data for charts
      const data = customers.map((customer) => {
        const customerData = taskResult.data.find(
          (data) => data.customer_id === customer.ga_customer_id.toString()
        );
        
        return {
          name: customer.ga_customer_name,
          budget: customer.ga_current_budget,
          spend: customerData?.spend || 0,
          clicks: customerData?.clicks || 0,
          conversions: customerData?.all_conversions || 0,
          cpc: customerData?.cpc || 0,
        };
      });
      
      setChartData(data);
      
      // Prepare pie chart data for spend distribution
      const pieData = customers.map((customer, index) => {
        const customerData = taskResult.data.find(
          (data) => data.customer_id === customer.ga_customer_id.toString()
        );
        
        return {
          name: customer.ga_customer_name,
          value: customerData?.spend || 0,
          color: COLORS[index % COLORS.length],
        };
      });
      
      setPieData(pieData);
    }
  }, [customers, taskResult]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-md border">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes("$") ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>
        
        {/* Performance Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(chartData.reduce((sum, item) => sum + item.budget, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all customers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(chartData.reduce((sum, item) => sum + item.spend, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all customers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {chartData.reduce((sum, item) => sum + item.conversions, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all customers
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Budget vs Spend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="budget"
                        name="Budget ($)"
                        fill="#8884d8"
                        barSize={30}
                      />
                      <Bar
                        dataKey="spend"
                        name="Spend ($)"
                        fill="#82ca9d"
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      No data available. Fetch data from the dashboard first.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Spend Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Spend Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {pieData.length > 0 && pieData.some(item => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      No spend data available. Fetch data from the dashboard first.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="clicks"
                      name="Clicks"
                      fill="#8884d8"
                      barSize={30}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="conversions"
                      name="Conversions"
                      fill="#82ca9d"
                      barSize={30}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="cpc"
                      name="CPC ($)"
                      fill="#ffc658"
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    No data available. Fetch data from the dashboard first.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
