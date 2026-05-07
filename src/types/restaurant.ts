
export interface RestaurantCategory {
  id: string;
  client_id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  client_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  price_label?: string;
  badge?: string;
  highlight: boolean;
  serves?: string;
  image_key?: string;
  whatsapp_enabled: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RestaurantOrder {
  id: string;
  client_id: string;
  customer_name: string;
  phone: string;
  email?: string;
  requested_time?: string;
  notes?: string;
  order_type: 'delivery' | 'takeaway' | 'dine_in';
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  source: string;
  subtotal: number;
  total: number;
  created_at: string;
  updated_at: string;
  items?: RestaurantOrderItem[];
}

export interface RestaurantOrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  notes?: string;
  created_at: string;
}

export interface RestaurantReservation {
  id: string;
  client_id: string;
  customer_name: string;
  phone: string;
  email?: string;
  reservation_date: string;
  reservation_time: string;
  people_count: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  source: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantPayment {
  id: string;
  client_id: string;
  financial_document_id?: string;
  client_profile_id?: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  external_reference?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantDashboardStats {
  ordersToday: number;
  salesToday: number;
  reservationsToday: number;
  pendingOrders: number;
  preparingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  topProducts: Array<{ name: string; quantity: number }>;
  totalReceived: number;
  openComplaints: number;
}
