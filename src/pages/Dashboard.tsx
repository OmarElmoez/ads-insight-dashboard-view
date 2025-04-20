
import { useEffect, useState } from "react";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore, Customer, CustomerData } from "@/stores/dashboardStore";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
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
  
  // Fetch managers on component mount
  useEffect(() => {
    fetchManagers().catch(console.error);
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
  
  // Function to find customer data from task result
  const findCustomerData = (customerId: number): CustomerData | undefined => {
    if (!taskResult || !taskResult.data) return undefined;
    
    return taskResult.data.find(
      (data) => data.customer_id === customerId.toString()
    );
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
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
            <div className="grid gap-4 md:grid-cols-3">
              {/* Manager/Customer Dropdown */}
              <div className="space-y-2">
                <label htmlFor="manager" className="text-sm font-medium">
                  Google Account
                </label>
                <Select onValueChange={handleManagerChange} value={selectedManagerId || ""}>
                  <SelectTrigger id="manager">
                    <SelectValue placeholder="Select Google Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date Range Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <span>
                        {startDate && endDate
                          ? `${format(startDate, "MMM d, yyyy")} - ${format(
                              endDate,
                              "MMM d, yyyy"
                            )}`
                          : "Select date range"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 space-y-3">
                      <div className="space-y-1.5">
                        <div className="font-medium text-sm">Start Date</div>
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date > (endDate || new Date())}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="font-medium text-sm">End Date</div>
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => date < (startDate || new Date(0)) || date > new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </div>
                      <Button
                        onClick={() => setIsDatePickerOpen(false)}
                        className="w-full"
                      >
                        Apply Range
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Apply Button */}
              <div className="flex items-end">
                <Button
                  onClick={handleFetchData}
                  disabled={!selectedManagerId || !startDate || !endDate || taskStatus === "STARTED"}
                  className="w-full"
                >
                  {taskStatus === "STARTED" ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Loading Data...
                    </>
                  ) : (
                    "Fetch Data"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Customer Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Current Budget</TableHead>
                    <TableHead>Ideal Daily Spend</TableHead>
                    <TableHead>Budget Pacing</TableHead>
                    <TableHead>CPC</TableHead>
                    <TableHead>Spend</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Conversion Value</TableHead>
                    <TableHead>Cost Per Conversion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length > 0 ? (
                    customers.map((customer: Customer) => {
                      const customerData = findCustomerData(customer.ga_customer_id);
                      
                      return (
                        <TableRow key={customer.ga_customer_id}>
                          <TableCell className="font-medium">
                            {customer.ga_customer_name}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(customer.ga_current_budget)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(customer.ga_ideal_daily_spend)}
                          </TableCell>
                          <TableCell>
                            {formatPercentage(customer.ga_budget_pacing)}
                          </TableCell>
                          <TableCell>
                            {customerData ? formatCurrency(customerData.cpc) : "-"}
                          </TableCell>
                          <TableCell>
                            {customerData ? formatCurrency(customerData.spend) : "-"}
                          </TableCell>
                          <TableCell>
                            {customerData ? customerData.clicks.toLocaleString() : "-"}
                          </TableCell>
                          <TableCell>
                            {customerData
                              ? customerData.all_conversions.toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {customerData
                              ? formatCurrency(customerData.conversion_value)
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {customerData
                              ? formatCurrency(customerData.cost_per_conversions)
                              : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-6">
                        {selectedManagerId
                          ? "No customer data available. Select a date range and click 'Fetch Data'."
                          : "Please select a Google account first."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Task Status */}
            {currentTaskId && taskStatus && taskStatus !== "SUCCESS" && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
                <Loader className="h-5 w-5 text-yellow-600 mr-2 animate-spin" />
                <div>
                  <p className="text-yellow-700">
                    Data retrieval in progress...{" "}
                    <span className="font-medium">Status: {taskStatus}</span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
