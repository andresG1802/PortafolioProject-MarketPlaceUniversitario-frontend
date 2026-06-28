export type CategoryType = 'apuntes' | 'laptops' | 'accesorios';
export type ProductCondition = 'nuevo' | 'como_nuevo' | 'bueno' | 'aceptable';
export type ProductStatus = 'disponible' | 'vendido' | 'pausado';

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  university: string | null;
  reputationScore: number;
  totalReviews: number;
  createdAt: string;
}

export interface Product {
  id: number;
  sellerId: number;
  sellerName?: string;
  sellerAvatar?: string | null;
  sellerReputation?: number;
  title: string;
  description: string;
  price: number;
  category: CategoryType;
  condition: ProductCondition | null;
  status: ProductStatus;
  images: string[];
  subject: string | null;
  university: string | null;
  views: number;
  createdAt: string;
}

export interface Review {
  id: number;
  reviewerId: number;
  reviewerName?: string;
  reviewerAvatar?: string | null;
  reviewedId: number;
  productId: number | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName?: string;
  senderAvatar?: string | null;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: number;
  productId: number | null;
  productTitle?: string;
  productImage?: string | null;
  buyerId: number;
  buyerName?: string;
  buyerAvatar?: string | null;
  sellerId: number;
  sellerName?: string;
  sellerAvatar?: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface Favorite {
  id: number;
  userId: number;
  productId: number;
  productTitle?: string;
  productPrice?: number;
  productImage?: string | null;
  productCategory?: CategoryType;
  productStatus?: ProductStatus;
  sellerName?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  apuntes: 'Apuntes',
  laptops: 'Laptops',
  accesorios: 'Accesorios',
};

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  nuevo: 'Nuevo',
  como_nuevo: 'Como nuevo',
  bueno: 'Bueno',
  aceptable: 'Aceptable',
};
