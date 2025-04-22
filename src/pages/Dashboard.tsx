import { useEffect, useState } from "react";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboardStore";
import DataFilters from "@/components/dashboard/DataFilters";
import CustomerPerformanceTable from "@/components/dashboard/CustomerPerformanceTable";

const Dashboard = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);

  const {
    availableManagers,
    selectedManagerId,
    customers,
    currentTaskId,
    taskStatus,
    taskResult,
    fetchManagers,
    setSelectedManager,
    fetchCustomers,
    setDateRange,
    fetchCustomerData,
  } = useDashboardStore();

  // Format currency
  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '$0.00';
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0.00%';
    }
    return `${value.toFixed(2)}%`;
  };

  // Fetch managers on component mount
  useEffect(() => {
    const getManagers = async () => {
      setIsLoadingManagers(true);
      try {
        await fetchManagers();
      } catch (error) {
        console.error("Failed to fetch managers:", error);
      } finally {
        setIsLoadingManagers(false);
      }
    };
    
    getManagers();
  }, [fetchManagers]);

  // Fetch customers when a manager is selected
  useEffect(() => {
    if (selectedManagerId) {
      fetchCustomers().catch(console.error);
    }
  }, [selectedManagerId, fetchCustomers]);

  // Format dates for API and update store
  useEffect(() => {
    if (startDate && endDate) {
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");
      setDateRange(formattedStartDate, formattedEndDate);
    }
  }, [startDate, endDate, setDateRange]);

  // Handle manager selection
  const handleManagerChange = (value: string) => {
    setSelectedManager(value);
  };

  // Handle fetch data
  const handleFetchData = async () => {
    if (!selectedManagerId || !startDate || !endDate) {
      alert("Please select a manager and date range first");
      return;
    }

    try {
      await fetchCustomerData();
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
      alert("Failed to fetch data. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-2xl font-bold">Ads Dashboard</h1>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Data Filters</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingManagers ? (
              <div className="flex items-center justify-center h-24">
                <Loader className="h-6 w-6 animate-spin mr-2" />
                <span>Loading managers...</span>
              </div>
            ) : (
              <DataFilters
                availableManagers={availableManagers}
                selectedManagerId={selectedManagerId}
                startDate={startDate}
                endDate={endDate}
                taskStatus={taskStatus}
                onManagerChange={handleManagerChange}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onFetchData={handleFetchData}
              />
            )}
          </CardContent>
        </Card>

        {/* Customer Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerPerformanceTable
              customers={customers}
              taskStatus={taskStatus}
              taskResult={taskResult}
              selectedManagerId={selectedManagerId}
              formatCurrency={formatCurrency}
              formatPercentage={formatPercentage}
              refreshCustomers={fetchCustomers}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
