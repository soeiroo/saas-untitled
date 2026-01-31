export interface Subscription {
  id: string;
  userId: string;
  name: string;
  price: number;
  sharedPrice?: number | null;
  renewalDate: string;
  category: string;
  plan: string;
  period: string;
  createdAt: string;
  icon: string;
}

