
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  return (
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
                onSelect={onStartDateChange}
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
                onSelect={onEndDateChange}
                disabled={(date) =>
                  date < (startDate || new Date(0)) || date > new Date()
                }
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
  );
};

export default DateRangePicker;
