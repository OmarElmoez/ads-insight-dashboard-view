
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Loader } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";

interface FilterValues {
  label: string;
  page_size: string;
  search: string;
}

interface Label {
  id: number;
  label: string;
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilterApply: (filters: FilterValues) => void;
}

export function FilterDialog({
  open,
  onOpenChange,
  onFilterApply
}: FilterDialogProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoadingLabels, setIsLoadingLabels] = useState(true);

  const form = useForm<FilterValues>({
    defaultValues: {
      label: "",
      page_size: "10",
      search: ""
    },
  });

  // Available page sizes
  const pageSizeOptions = [
    { value: "10", label: "10 rows" },
    { value: "25", label: "25 rows" },
    { value: "50", label: "50 rows" },
    { value: "100", label: "100 rows" }
  ];

  // Load labels when component mounts
  useEffect(() => {
    if (open) {
      loadLabels();
    }
  }, [open]);

  const loadLabels = async () => {
    setIsLoadingLabels(true);
    try {
      const response = await api.get("/api/customer/labels/");
      const labelsData = response.data || [];
      setLabels(labelsData);
    } catch (error) {
      console.error("Failed to load labels:", error);
      toast({
        title: "Error",
        description: "Failed to load labels. Please try again.",
        variant: "destructive",
      });
      setLabels([]);
    } finally {
      setIsLoadingLabels(false);
    }
  };

  // Handle form submission
  const onSubmit = (values: FilterValues) => {
    onFilterApply(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Customers</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Label Filter */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Label</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a label" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Labels</SelectItem>
                        {isLoadingLabels ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          labels.map((label) => (
                            <SelectItem key={label.id} value={label.id.toString()}>
                              {label.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Page Size Filter */}
            <FormField
              control={form.control}
              name="page_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rows per page</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select page size" />
                      </SelectTrigger>
                      <SelectContent>
                        {pageSizeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Search Filter */}
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search by name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter business name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Apply Filters
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
