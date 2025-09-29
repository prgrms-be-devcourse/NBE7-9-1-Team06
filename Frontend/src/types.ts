export type RawProduct = Record<string, unknown>;

export type Product = {
  id: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
  stock: number | null;
  isActive: boolean;
};

export type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
};
