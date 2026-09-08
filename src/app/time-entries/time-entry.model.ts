export type TimeEntryStatus =
  | 'PENDING'
  | 'BILLED'
  | 'PAID'
  | 'CANCELLED';

export interface TimeEntry {
  id: string;
  partnerId: string;
  projectId: string;
  startDate: string;
  endDate: string | null;
  hours: number;
  description: string;
  hourlyRate: number;
  totalValue: number;
  status: TimeEntryStatus;
  createdAt: string;
}