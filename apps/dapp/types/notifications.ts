export interface NotificationType {
  id: string;
  type: string;
  title?: string;
  message: string;
  amount: number;
  link?: string;
  is_read?: boolean;
  ts: Date;
  // legacy MongoDB fields
  tx?: string;
  user?: string;
}
