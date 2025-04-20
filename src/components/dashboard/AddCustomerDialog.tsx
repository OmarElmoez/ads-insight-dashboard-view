import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/axios";
import { AlertCircle, Plus } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddLabelDialog } from "./AddLabelDialog";

// Define types
interface Label {
  id: number;
  name: string;
}

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function AddCustomerDialog({ open, onOpenChange }: AddCustomerDialogProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const [showAddLabelDialog, setShowAddLabelDialog] = useState(false);

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

  // Load labels on component mount or when the add label dialog closes
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
      setLabels(response.data || []);
    } catch (error) {
      console.error("Failed to load labels:", error);
      toast({
        title: "Error",
        description: "Failed to load labels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLabels(false);
    }
  };

  // Handler for when a new label is added
  const handleLabelAdded = (newLabel: Label) => {
    setLabels([...labels, newLabel]);
    form.setValue("label_id", newLabel.id.toString());
    toast({
      title: "Success",
      description: "New label added successfully",
    });

    // Reload labels to ensure we have the most up-to-date list
    loadLabels();
  };

  // Submit handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form values:", values);
    // Here you would submit to your API
    // For now, just log and close
    toast({
      title: "Customer added",
      description: "Customer information has been submitted",
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Fill in the customer details below to add a new customer.
            </DialogDescription>
          </DialogHeader>

          {labels.length === 0 && (
            <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Labels Available</AlertTitle>
              <AlertDescription className="mt-2">
                You need to create at least one label before adding a customer. 
                Labels help organize and categorize your customers.
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
          )}

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
                      <Input placeholder="Enter customer ID" {...field} />
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
                    {labels.length === 0 ? (
                      <div className="text-sm text-gray-500 italic">
                        Please create a label first using the button above.
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
                                  {label.name}
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
                <Button type="submit" disabled={labels.length === 0}>Add Customer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Label Dialog */}
      <AddLabelDialog
        open={showAddLabelDialog}
        onOpenChange={setShowAddLabelDialog}
        onLabelAdded={handleLabelAdded}
      />
    </>
  );
} 