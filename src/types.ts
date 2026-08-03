export interface GroceryConfig {
  items: Array<{ id: number; name: string; category: string; icon: string; image?: string }>;
  units: string[];
  categoryOrder: string[];
  user: {
    name: string;
    mobile: string;
    shopkeeperMobile: string;
  };
}

export interface GroceryItem {
  id: number;
  name: string;
  category: string;
  icon: string;
  image?: string;
  unit: string;
  quantity: string;
  selected: boolean;
}
