export type Tier = 'Bronze' | 'Silver' | 'Gold';
export type CustomerSegment = 'New Member' | 'Active' | 'Churn Risk' | 'Champion' | 'Referral King';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  points: number;
  stamps: number; // 0 to 9
  tier: Tier;
  segment?: CustomerSegment;
  joinDate: string;
  birthday?: string;
  lastVisit: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  drinkType: string;
  price: number;
  timestamp: string;
  staff: string;
  action: 'purchase' | 'redemption';
  pointsEarned: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  type: 'personalized' | 'global';
  targetCustomerId?: string;
  expiry: string;
  icon: string;
}

export interface DashboardStats {
  revenueOverTime: { date: string; amount: number }[];
  customerGrowth: { date: string; new: number; returning: number }[];
  topCustomers: { name: string; spend: number }[];
  popularDrinks: { name: string; count: number }[];
  rewardsIssued: { date: string; count: number }[];
  segmentData: { name: CustomerSegment; value: number }[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'ai_insight';
}
