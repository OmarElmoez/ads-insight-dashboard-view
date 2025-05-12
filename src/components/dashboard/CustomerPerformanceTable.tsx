
  const findCustomerData = (customerId: number): CustomerData | undefined => {
    if (!taskResult || !taskResult.data || !Array.isArray(taskResult.data)) return undefined;
    return taskResult.data.find(
      (data) => data && data.customer_id === customerId.toString()
    );
  };

  // Handle customer deletion
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    setIsDeleting(true);
    try {
      // Use id instead of ga_customer_id for API calls
      await api.delete(`/api/customer/customers/${customerToDelete.id}/`);
      toast({
        title: "Customer deleted",
        description: `${customerToDelete.ga_customer_name} has been removed successfully.`,
      });
      
      // Refresh customers list
      refreshCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setCustomerToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Handle edit customer
  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setShowEditCustomer(true);
  };

  // Handle edit customer dialog change
  const handleEditCustomerDialogChange = (open: boolean) => {
    setShowEditCustomer(open);
    if (!open) {
      setCustomerToEdit(null);
    }
  };
