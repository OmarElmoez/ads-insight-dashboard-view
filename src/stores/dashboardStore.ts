import { create } from 'zustand';
import api from '@/lib/axios';

export interface Customer {
  ga_customer_id: number;
  ga_customer_name: string;
  ga_current_budget: number;
  ga_ideal_daily_spend: number;
  ga_budget_pacing: number;
  ga_customer_label: string | null;
}

export interface CustomerData {
  cpc: number;
  spend: number;
  clicks: number;
  customer_id: string;
  business_name: string;
  all_conversions: number;
  conversion_value: number;
  cost_per_conversions: number;
}

export interface ProcessedAccount {
  id: string;
  name: string;
}

export type TaskStatus = 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY' | 'REVOKED';

export interface TaskResult {
  data: CustomerData[];
  processed_count: number;
  processed_accounts: ProcessedAccount[];
}

interface TaskResponse {
  task_id: string;
  status: TaskStatus;
  manager_id?: string;
  client_count?: number;
  message?: string;
  created_at?: string;
  completed_at?: string;
  result?: TaskResult;
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

interface ManagerCustomer {
  id: string;
  name: string;
}

interface DashboardState {
  // Selected date range
  startDate: string | null;
  endDate: string | null;
  setDateRange: (startDate: string, endDate: string) => void;
  
  // Manager/customer selection
  availableManagers: ManagerCustomer[];
  selectedManagerId: string | null;
  fetchManagers: () => Promise<void>;
  setSelectedManager: (managerId: string) => void;
  
  // Customer data
  customers: Customer[];
  fetchCustomers: () => Promise<Customer[]>;
  
  // Task management
  currentTaskId: string | null;
  taskStatus: TaskStatus | null;
  taskResult: TaskResult | null;
  fetchCustomerData: () => Promise<void>;
  checkTaskStatus: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Date range
  startDate: null,
  endDate: null,
  setDateRange: (startDate, endDate) => set({ startDate, endDate }),
  
  // Manager/customer selection
  availableManagers: [],
  selectedManagerId: null,
  fetchManagers: async () => {
    try {
      
      const response = await api.get('api/googledata/accessible-customers');
      
      // Ensure we're setting the correct data structure from the API response
      // The API might return the array directly or nested in a data property
      let managersData = [];
      
      if (response && response.data) {
        managersData = response.data.customers;
      }
      
      set({ availableManagers: managersData });
    } catch (error) {
            // Set empty array on error to avoid map issues
      set({ availableManagers: [] });
      throw error;
    }
  },
  setSelectedManager: (managerId) => set({ selectedManagerId: managerId }),
  
  // Customer data
  customers: [],
  fetchCustomers: async () => {
    try {
      
      const response = await api.get('api/customer/customers/');
      
      // Ensure we're setting the correct data structure from the API response
      let customersData: Customer[] = [];
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          customersData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          customersData = response.data.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          customersData = response.data.results;
        } else if (response.data.customers && Array.isArray(response.data.customers)) {
          customersData = response.data.customers;
        }
      }
      
      // Ensure all customer objects have the required fields
      customersData = customersData
        .filter(customer => customer && typeof customer === 'object')
        .map(customer => ({
          ga_customer_id: customer.ga_customer_id || 0,
          ga_customer_name: customer.ga_customer_name || 'Unknown Customer',
          ga_current_budget: customer.ga_current_budget || 0,
          ga_ideal_daily_spend: customer.ga_ideal_daily_spend || 0,
          ga_budget_pacing: customer.ga_budget_pacing || 0,
          ga_customer_label: customer.ga_customer_label || null
        }));
      
      set({ customers: customersData });
      return customersData;
    } catch (error) {
      set({ customers: [] });
      throw error;
    }
  },
  
  // Task management
  currentTaskId: null,
  taskStatus: null,
  taskResult: null,
  fetchCustomerData: async () => {
    const { selectedManagerId, startDate, endDate, customers } = get();
    
    if (!selectedManagerId || !startDate || !endDate || !customers.length) {
      throw new Error('Missing required parameters for fetching customer data');
    }
    
    try {
      
      // Extract client IDs from customers
      const clientIds = customers.map(customer => customer.ga_customer_id.toString());
      
      // Start the async task
      const response = await api.post('api/googledata/async/specific-clients', {
        manager_id: selectedManagerId,
        client_ids: clientIds,
        start_date: startDate,
        end_date: endDate
      });
      
      const taskResponse = response.data as TaskResponse;
      
      set({
        currentTaskId: taskResponse.task_id,
        taskStatus: taskResponse.status
      });
      
      // Immediately start checking the task status
      await get().checkTaskStatus();
    } catch (error) {
      set({ taskStatus: 'FAILURE' });
      throw error;
    }
  },
  checkTaskStatus: async () => {
    const { currentTaskId } = get();
    
    if (!currentTaskId) {
      throw new Error('No task ID available to check status');
    }
    
    try {
      
      const response = await api.get(`api/googledata/tasks/${currentTaskId}`);
      const taskResponse = response.data as TaskResponse;
      
      set({ taskStatus: taskResponse.status });
      
      if (taskResponse.status === 'SUCCESS' && taskResponse.result) {
        set({ taskResult: taskResponse.result });
      } else if (
        // Continue polling for these statuses
        taskResponse.status === 'PENDING' || 
        taskResponse.status === 'STARTED' || 
        taskResponse.status === 'RETRY'
      ) {
        // Continue polling if task is still in progress
        setTimeout(() => get().checkTaskStatus(), 1000);
      }
      // For FAILURE and REVOKED, we stop polling
      
    } catch (error) {
      set({ taskStatus: 'FAILURE' });
      throw error;
    }
  }
}));
