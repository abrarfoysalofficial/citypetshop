/**
 * Service layer interfaces: products, orders, auth.
 * Implementations: Sanity/Local/Auto (products), Supabase/Local (orders), Supabase/Demo (auth).
 */
import type { Product, Category, HomeSection, DemoOrder } from "@/src/data/types";

export interface ProductsRepository {
  listProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  listCategories(): Promise<Category[]>;
  getHomeContent(): Promise<HomeSection>;
  searchProducts(query: string): Promise<Product[]>;
}

export interface CreateOrderInput {
  customerId?: string;
  customerName: string;
  email: string;
  phone?: string;
  total: number;
  items: { productId: string; name: string; qty: number; price: number }[];
  shippingAddress?: string;
  paymentMethod?: string;
}

export interface OrdersRepository {
  createOrder(input: CreateOrderInput): Promise<{ orderId: string } | { error: string }>;
  getOrderById(id: string): Promise<DemoOrder | null>;
  listOrdersByUser(userId: string): Promise<DemoOrder[]>;
  adminListOrders(): Promise<DemoOrder[]>;
}

export interface AuthSession {
  user: { id: string; email?: string; role?: string } | null;
}

export interface AuthService {
  signIn(email: string, password: string): Promise<{ error?: string }>;
  signOut(): Promise<void>;
  signUp(email: string, password: string, options?: { name?: string }): Promise<{ error?: string }>;
  otpSignIn(phone: string): Promise<{ error?: string }>;
  getSession(): Promise<AuthSession | null>;
}
