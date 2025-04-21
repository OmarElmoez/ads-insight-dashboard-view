import { Loader, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangePicker from "./DateRangePicker";
import { TaskStatus } from "@/stores/dashboardStore";

interface DataFiltersProps {
  availableManagers: Array<{ id: string; name: string }>;
  selectedManagerId: string | null;
  startDate: Date | undefined;
  endDate: Date | undefined;
  taskStatus: TaskStatus | null;
  onManagerChange: (value: string) => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onFetchData: () => void;
}

const DataFilters = ({
  availableManagers,
  selectedManagerId,
  startDate,
  endDate,
  taskStatus,
  onManagerChange,
  onStartDateChange,
  onEndDateChange,
  onFetchData,
}: DataFiltersProps) => {
  // Determine if button should be disabled
  const isButtonDisabled = !selectedManagerId || 
                          !startDate || 
                          !endDate || 
                          taskStatus === "STARTED" || 
                          taskStatus === "PENDING" ||
                          taskStatus === "RETRY";

  // Get button text and icon based on status
  const getButtonContent = () => {
    switch(taskStatus) {
      case "STARTED":
        return (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        );
      case "PENDING":
        return (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Queued...
          </>
        );
      case "RETRY":
        return (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Retrying...
          </>
        );
      case "FAILURE":
        return "Retry Data Fetch";
      case "REVOKED":
        return "Fetch Data Again";
      default:
        return "Fetch Data";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Manager/Customer Dropdown */}
      <div className="space-y-2">
        <label htmlFor="manager" className="text-sm font-medium">
          Google Account
        </label>
        <Select onValueChange={onManagerChange} value={selectedManagerId || ""}>
          <SelectTrigger id="manager">
            <SelectValue placeholder="Select Google Account" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(availableManagers) && availableManagers.length > 0 ? (
              availableManagers.map((manager) => (
                <SelectItem key={manager.id || 'unknown'} value={manager.id || 'unknown'}>
                  {manager.name || 'Unnamed Account'}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-accounts" disabled>
                No accounts available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />

      {/* Apply Button */}
      <div className="flex items-end">
        <Button
          onClick={onFetchData}
          disabled={isButtonDisabled}
          className="w-full"
        >
          {getButtonContent()}
        </Button>
      </div>
    </div>
  );
};

export default DataFilters;
