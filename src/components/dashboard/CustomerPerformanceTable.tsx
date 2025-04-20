
import { Customer, CustomerData } from "@/stores/dashboardStore";
import { Loader } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const findCustomerData = (customerId: number): CustomerData | undefined => {
    if (!taskResult || !taskResult.data) return undefined;
    return taskResult.data.find(
      (data) => data.customer_id === customerId.toString()
    );
  };

  return (
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
  );
};

export default CustomerPerformanceTable;
