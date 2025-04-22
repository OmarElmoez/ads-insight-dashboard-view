import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/axios";
import { AlertCircle, Loader, Plus } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddLabelDialog } from "@/components/dashboard/AddLabelDialog";
import { Customer } from "@/stores/dashboardStore";

// Define types
interface Label {
  label: string;
  id: number;
}

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  refreshCustomers: () => void;
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  budget: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Budget must be a positive number",
  }),
  customer_id: z.string().min(1, { message: "Customer ID is required" }),
  label_id: z.string().min(1, { message: "Label is required" }),
});

export function EditCustomerDialog({ open, onOpenChange, customer, refreshCustomers }: EditCustomerDialogProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoadingLabels, setIsLoadingLabels] = useState(true);
  const [showAddLabelDialog, setShowAddLabelDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      budget: "",
      customer_id: "",
      label_id: "",
    },
  });

  // Set form default values when customer changes
  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.ga_customer_name || "",
        budget: customer.ga_current_budget?.toString() || "",
        customer_id: customer.ga_customer_id?.toString() || "",
        label_id: customer.ga_customer_label?.toString() || "",
      });
      
    }
  }, [customer, form]);

  // Load labels when dialog opens
  useEffect(() => {
    if (open) {
      loadLabels();
    }
  }, [open]);

  // Function to load labels from API
  const loadLabels = async () => {
    setIsLoadingLabels(true);
    try {
      const response = await api.get("/api/customer/labels/");
      const labelsData = response.data || [];
      setLabels(labelsData);
    } catch (error) {
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

  // Handler for when a new label is added
  const handleLabelAdded = (newLabel: Label) => {
    setLabels(prevLabels => [...prevLabels, newLabel]);
    form.setValue("label_id", newLabel.id.toString());
    toast({
      title: "Success",
      description: "New label added successfully",
    });
    setShowAddLabelDialog(false);
  };

  // Handle add label dialog open/close
  const handleAddLabelDialogChange = (open: boolean) => {
    setShowAddLabelDialog(open);
  };

  // Submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!customer) return;

    setIsSubmitting(true);
    try {
      // Map form values to required API parameters
      const payload = {
        ga_customer_id: values.customer_id,
        ga_customer_name: values.name,
        ga_current_budget: Number(values.budget),
        ga_customer_label: Number(values.label_id)
      };
      
      // Submit to the correct API endpoint
      await api.put(`/api/customer/customers/${customer.id}/`, payload);
      
      toast({
        title: "Customer updated",
        description: "Customer has been successfully updated",
      });
      
      // Refresh the customers list
      refreshCustomers();
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] min-h-[500px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the customer details below.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow">
            {isLoadingLabels ? (
              <div className="flex justify-center items-center py-4">
                <Loader className="h-6 w-6 animate-spin text-gray-500" />
                <span className="ml-2 text-sm text-gray-500">Loading labels...</span>
              </div>
            ) : labels.length === 0 ? (
              <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Labels Available</AlertTitle>
                <AlertDescription className="mt-2">
                  You need to create at least one label before updating a customer. 
                  <Button 
                    type="button" 
                    onClick={() => setShowAddLabelDialog(true)}
                    className="w-full mt-2 bg-amber-500 text-white hover:bg-amber-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Label
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter budget amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer ID" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="label_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Label</FormLabel>
                        {isLoadingLabels ? (
                          <div className="text-sm text-gray-500 italic flex items-center">
                            <Loader className="h-3 w-3 animate-spin mr-2" /> Loading labels...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isLoadingLabels}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a label" />
                                </SelectTrigger>
                                <SelectContent>
                                  {labels.map((label) => (
                                    <SelectItem key={label.id} value={label.id.toString()}>
                                      {label.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <Button
                              type="button" 
                              size="sm" 
                              variant="outline"
                              onClick={() => setShowAddLabelDialog(true)}
                              title="Add another label"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoadingLabels || labels.length === 0 || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Customer"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Label Dialog */}
      {showAddLabelDialog && (
        <AddLabelDialog
          open={showAddLabelDialog}
          onOpenChange={handleAddLabelDialogChange}
          onLabelAdded={handleLabelAdded}
        />
      )}
    </>
  );
} 