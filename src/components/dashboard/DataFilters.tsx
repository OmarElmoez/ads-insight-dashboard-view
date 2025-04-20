
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangePicker from "./DateRangePicker";

interface DataFiltersProps {
  availableManagers: Array<{ id: string; name: string }>;
  selectedManagerId: string | null;
  startDate: Date | undefined;
  endDate: Date | undefined;
  taskStatus: string | null;
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
            {availableManagers.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                {manager.name}
              </SelectItem>
            ))}
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
  );
};

export default DataFilters;
