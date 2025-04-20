import { Customer, CustomerData } from "@/stores/dashboardStore";
import { Loader, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddCustomerDialog } from "./AddCustomerDialog";

interface CustomerPerformanceTableProps {
  customers: Customer[];
  taskStatus: string | null;
  taskResult: { data: CustomerData[] } | null;
  selectedManagerId: string | null;
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
}

const CustomerPerformanceTable = ({
  customers,
  taskStatus,
  taskResult,
  selectedManagerId,
  formatCurrency,
  formatPercentage,
}: CustomerPerformanceTableProps) => {
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  const findCustomerData = (customerId: number): CustomerData | undefined => {
    if (!taskResult || !taskResult.data || !Array.isArray(taskResult.data)) return undefined;
    return taskResult.data.find(
      (data) => data && data.customer_id === customerId.toString()
    );
  };

  // Ensure customers is an array
  const safeCustomers = Array.isArray(customers) ? customers : [];

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer ID</TableHead>
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
            {safeCustomers.length > 0 ? (
              safeCustomers.map((customer: Customer) => {
                const customerData = findCustomerData(customer.ga_customer_id);
                return (
                  <TableRow key={customer.ga_customer_id || 'unknown'}>
                    <TableCell>
                      {customer.ga_customer_id || 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {customer.ga_customer_name || 'Unknown Customer'}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(customer.ga_current_budget || 0)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(customer.ga_ideal_daily_spend || 0)}
                    </TableCell>
                    <TableCell>
                      {formatPercentage(customer.ga_budget_pacing || 0)}
                    </TableCell>
                    <TableCell>
                      {customerData && typeof customerData.cpc === 'number' 
                        ? formatCurrency(customerData.cpc) 
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {customerData && typeof customerData.spend === 'number'
                        ? formatCurrency(customerData.spend) 
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {customerData && typeof customerData.clicks === 'number'
                        ? customerData.clicks.toLocaleString() 
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {customerData && typeof customerData.all_conversions === 'number'
                        ? customerData.all_conversions.toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {customerData && typeof customerData.conversion_value === 'number'
                        ? formatCurrency(customerData.conversion_value)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {customerData && typeof customerData.cost_per_conversions === 'number'
                        ? formatCurrency(customerData.cost_per_conversions)
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-6">
                  {selectedManagerId
                    ? "No customer data available. Select a date range and click 'Fetch Data'."
                    : "Please select a Google account first."}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={11} className="text-center py-4 hover:bg-gray-50">
                <Button 
                  variant="ghost" 
                  className="flex items-center mx-auto text-blue-600 hover:text-blue-800"
                  onClick={() => setShowAddCustomer(true)}
                >
                  <Plus className="h-5 w-5 mr-1" />
                  Add New Customer
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Task Status */}
        {taskStatus && taskStatus !== "SUCCESS" && (
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
      </div>

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={showAddCustomer} 
        onOpenChange={setShowAddCustomer}
      />
    </>
  );
};

export default CustomerPerformanceTable;
