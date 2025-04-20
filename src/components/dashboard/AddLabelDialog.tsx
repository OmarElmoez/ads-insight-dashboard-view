import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import api from "@/lib/axios";

// Define types
interface Label {
  id: number;
  label: string;
}

interface AddLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLabelAdded: (label: Label) => void;
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Label name is required" }),
});

export function AddLabelDialog({ open, onOpenChange, onLabelAdded }: AddLabelDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // Submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/api/customer/labels/", {
        label: values.name.trim(),
      });
      
      if (response.data) {
        // Call the callback with the new label
        onLabelAdded(response.data);
        
        // Close this dialog
        onOpenChange(false);
        
        // Reset the form
        form.reset();
      }
    } catch (error) {
      console.error("Failed to add label:", error);
      toast({
        title: "Error",
        description: "Failed to add new label. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Label</DialogTitle>
          <DialogDescription>
            Create a new label for organizing customers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter label name" 
                      {...field} 
                      autoFocus
                      disabled={isSubmitting}
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
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : "Add Label"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 