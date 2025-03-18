export interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: Department;
  departmentId?: string;
  role: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string; // 'open', 'in_progress', 'resolved', 'closed'
  priority: string; // 'low', 'medium', 'high', 'critical'
  customerId: string;
  customer?: Customer;
  customerName?: string;
  customerEmail?: string;
  assignedToId?: string;
  assignedTo?: Employee;
  departmentId?: string;
  department?: Department;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
  comments?: TicketComment[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  content: string;
  senderId: string;
  senderType: string; // 'customer', 'employee', 'system', 'ai'
  createdAt: string;
}

export interface TicketComment {
  id: string;
  text: string;
  createdById: string;
  createdAt: string;
}

export interface Report {
  id: string;
  name: string;
  type: string;
  parameters: any;
  createdById: string;
  createdAt: string;
  updatedAt: string;
} 