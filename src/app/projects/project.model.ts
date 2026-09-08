export type ProjectBillingType = 'CLOSED_SCOPE' | 'HOURLY';

export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Project {
  id: string;
  name: string;
  partnerId: string;
  billingType: ProjectBillingType;
  hourlyRate: number;
  estimatedHours: number;
  startDate: string;
  status: ProjectStatus;
  description: string;
  createdAt: string;
}
