export type CampaignStatus = 'pending' | 'approved' | 'rejected';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  story: string | null;
  category_id: string | null;
  goal_amount: number;
  raised_amount: number;
  image_url: string | null;
  status: CampaignStatus;
  creator_name: string;
  creator_email: string | null;
  location: string | null;
  featured: boolean;
  created_at: string;
  categories?: Pick<Category, 'id' | 'name' | 'slug'> | null;
}

export interface Donation {
  id: string;
  campaign_id: string;
  donor_name: string;
  donor_email: string | null;
  message: string | null;
  amount: number;
  payment_method: 'stripe' | 'paypal';
  payment_status: 'succeeded' | 'pending' | 'failed';
  frequency: 'one_time' | 'monthly';
  next_charge_at: string | null;
  created_at: string;
  campaigns?: Pick<Campaign, 'id' | 'title' | 'image_url'> | null;
}

export interface Comment {
  id: string;
  campaign_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export interface CampaignUpdate {
  id: string;
  campaign_id: string;
  title: string;
  body: string;
  created_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  handled: boolean;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  campaign_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at: string | null;
  campaigns?: Pick<Campaign, 'id' | 'title'> | null;
}
