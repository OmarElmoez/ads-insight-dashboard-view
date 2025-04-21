import { Customer, CustomerData, TaskStatus } from "@/stores/dashboardStore";
import { Loader, Plus, RefreshCw, AlertCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AddCustomerDialog } from "./AddCustomerDialog";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

interface Label {
  id: number;
  label: string;
}

interface CustomerPerformanceTableProps {
  customers: Customer[];
  taskStatus: TaskStatus | null;
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
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoadingLabels, setIsLoadingLabels] = useState(true);

  // Load labels function that can be called whenever needed
  const loadLabels = async () => {
    setIsLoadingLabels(true);
    try {
      const response = await api.get("/api/customer/labels/");
      const labelsData = response.data || [];
      setLabels(labelsData);
    } catch (error) {
      console.error("Failed to load labels:", error);
      setLabels([]);
    } finally {
      setIsLoadingLabels(false);
    }
  };

  // Load labels when component mounts
  useEffect(() => {
    loadLabels();
  }, []);

  // Handle AddCustomerDialog state change
  const handleAddCustomerDialogChange = (open: boolean) => {
    setShowAddCustomer(open);
    
    // When dialog closes, refresh the labels list
    if (!open) {
      loadLabels();
    }
  };

  // Get status display information based on the current task status
  const getStatusInfo = (status: TaskStatus | null) => {
    if (!status) return null;

    const statusInfo = {
      PENDING: {
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-700",
        icon: <Loader className="h-5 w-5 text-blue-600 mr-2 animate-spin" />,
        title: "Task queued",
        description: "Your request is in the queue and will start processing soon."
      },
      STARTED: {
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        textColor: "text-yellow-700",
        icon: <Loader className="h-5 w-5 text-yellow-600 mr-2 animate-spin" />,
        title: "Data retrieval in progress",
        description: "We're fetching your data. This may take a moment."
      },
      RETRY: {
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        textColor: "text-orange-700",
        icon: <RefreshCw className="h-5 w-5 text-orange-600 mr-2 animate-spin" />,
        title: "Retrying data fetch",
        description: "The system is retrying to retrieve your data."
      },
      FAILURE: {
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-700",
        icon: <XCircle className="h-5 w-5 text-red-600 mr-2" />,
        title: "Data retrieval failed",
        description: "Please try again later or contact support if the issue persists."
      },
      REVOKED: {
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        textColor: "text-gray-700",
        icon: <AlertCircle className="h-5 w-5 text-gray-600 mr-2" />,
        title: "Task cancelled",
        description: "The data retrieval task was cancelled."
      },
      SUCCESS: null // We don't show status for success
    };

    return statusInfo[status];
  };

  const statusInfo = getStatusInfo(taskStatus);

  const findCustomerData = (customerId: number): CustomerData | undefined => {
    if (!taskResult || !taskResult.data || !Array.isArray(taskResult.data)) return undefined;
    return taskResult.data.find(
      (data) => data && data.customer_id === customerId.toString()
    );
  };

  // Get label name from label ID
  const getLabelName = (labelId: string | number | null): string => {
    if (!labelId || isLoadingLabels) return "Unknown";
    const label = labels.find(l => l.id === Number(labelId));
    return label ? label.label : "Unknown";
  };

  // Generate a consistent color based on label ID
  const getLabelColor = (labelId: string | number | null): string => {
    if (!labelId) return "#9ca3af"; // Default gray color

    // Enhanced color palette with highly distinguishable colors
    const colors = [
      "#2563eb", // royal blue
      "#059669", // emerald
      "#dc2626", // deep red
      "#7c3aed", // vivid purple
      "#ea580c", // burnt orange
      "#0891b2", // cyan blue
      "#be123c", // ruby red
      "#4f46e5", // indigo
      "#b45309", // amber brown
      "#0d9488", // teal
      "#6d28d9", // violet
      "#db2777", // pink
      "#0369a1", // sky blue
      "#65a30d", // lime
      "#9f1239", // rose
      "#3730a3"  // dark indigo
    ];
    
    const colorIndex = Number(labelId) % colors.length;
    return colors[colorIndex];
  };

  // Get text color based on background color brightness
  const getTextColor = (bgColor: string): string => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Using WCAG contrast ratio formula for better accessibility
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Ensure customers is an array
  const safeCustomers = Array.isArray(customers) ? customers : [];

  // Common cell styles
  const cellStyles = "text-center";

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">CID</TableHead>
              <TableHead className="text-center">Business Name</TableHead>
              <TableHead className="text-center">Label</TableHead>
              <TableHead className="text-center">Current Budget Target</TableHead>
              <TableHead className="text-center">Ideal Daily Spend</TableHead>
              <TableHead className="text-center">Pacing</TableHead>
              <TableHead className="text-center">CPC</TableHead>
              <TableHead className="text-center">Spend</TableHead>
              <TableHead className="text-center">Clicks</TableHead>
              <TableHead className="text-center">Conversions</TableHead>
              <TableHead className="text-center">Conversion Value</TableHead>
              <TableHead className="text-center">Cost Per Conversion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeCustomers.length > 0 ? (
              safeCustomers.map((customer: Customer) => {
                const customerData = findCustomerData(customer.ga_customer_id);
                const bgColor = getLabelColor(customer.ga_customer_label);
                const textColor = getTextColor(bgColor);
                
                return (
                  <TableRow key={customer.ga_customer_id || 'unknown'}>
                    <TableCell className={cellStyles}>
                      {customer.ga_customer_id || 'N/A'}
                    </TableCell>
                    <TableCell className={cn(cellStyles, "font-medium")}>
                      {customer.ga_customer_name || 'Unknown Customer'}
                    </TableCell>
                    <TableCell className={cellStyles}>
                      {customer.ga_customer_label ? (
                        <div 
                          className="px-3 py-1.5 rounded text-xs font-medium mx-auto inline-block text-center"
                          style={{ 
                            backgroundColor: bgColor,
                            color: textColor,
                            minWidth: '90px',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          {getLabelName(customer.ga_customer_label)}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className={cellStyles}>
                      {formatCurrency(customer.ga_current_budget || 0)}
                    </TableCell>
                    <TableCell className={cellStyles}>
                      {formatCurrency(customer.ga_ideal_daily_spend || 0)}
                    </TableCell>
                    <TableCell className={cellStyles}>
                      {formatPercentage(customer.ga_budget_pacing || 0)}
                    </TableCell>
                    <TableCell className={cellStyles}>
                      {customerData && typeof customerData.cpc === 'number' 
                        ? formatCurrency(customerData.cpc) 
                        : "-"}
                    </TableCell>
                    <TableCell className={cellStyles}>
                      {customerData && typeof customerData.spend === 'number'
                        ? formatCurrency(customerData.spend) 
                        : "-"}
                    </TableCell>
                    <TableCell className={cellStyles}>
                      {customerData && typeof customerData.clicks === 'number'
                        ? customerData.clicks.toLocaleString() 
                        : "-"}
                    </TableCell>
                    <TableCell className={cellStyles}>
                      {customerData && typeof customerData.all_conversions === 'number'
                        ? customerData.all_conversions.toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell className={cellStyles}>
                      {customerData && typeof customerData.conversion_value === 'number'
                        ? formatCurrency(customerData.conversion_value)
                        : "-"}
                    </TableCell>
                    <TableCell className={cellStyles}>
                      {customerData && typeof customerData.cost_per_conversions === 'number'
                        ? formatCurrency(customerData.cost_per_conversions)
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-6">
                  {selectedManagerId
                    ? "No customer data available. Select a date range and click 'Fetch Data'."
                    : "Please select a Google account first."}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={12} className="text-center py-4 hover:bg-gray-50">
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

        {/* Task Status Display - Dynamic based on current status */}
        {statusInfo && (
          <div className={cn("mt-4 p-4 rounded-md flex items-center", statusInfo.bgColor, statusInfo.borderColor)}>
            {statusInfo.icon}
            <div>
              <p className={cn("font-medium", statusInfo.textColor)}>
                {statusInfo.title}
                <span className="font-normal ml-2">Status: {taskStatus}</span>
              </p>
              <p className={cn("text-sm mt-1", statusInfo.textColor)}>
                {statusInfo.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={showAddCustomer} 
        onOpenChange={handleAddCustomerDialogChange}
      />
    </>
  );
};

export default CustomerPerformanceTable;
