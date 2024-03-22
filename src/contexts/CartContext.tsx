import { Product, TProduct } from "@/API";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type TCart = {
  product: TProduct;
  quantity: number;
};

class Cart {
  constructor(
    private readonly _product: Product,
    private _quantity: number,
  ) {
    this._product = _product;
    this._quantity = _quantity;
  }

  get product(): Product {
    return this._product;
  }

  get quantity(): number {
    return this._quantity;
  }

  set quantity(value: number) {
    this._quantity = value;
  }

  toJSON(): TCart {
    return {
      product: this.product.toJSON(),
      quantity: this.quantity,
    };
  }

  static fromJSON(data: TCart): Cart {
    return new Cart(Product.fromJSON(data.product), data.quantity);
  }
}

type CartContextType = {
  items: Cart[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (product: Product) => void;
  updateItemQuantity: (product: Product, quantity: number) => void;

  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  registerSale: () => void;
  clearCart: () => void;
};

export const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateItemQuantity: () => {},
  drawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  registerSale: () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const isMounted = useRef(false);
  const [items, setItems] = useState<Cart[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const addItem = useCallback(
    (product: Product, quantity: number) => {
      const existingItem = items.find((item) => item.product.id === product.id);
      if (existingItem) {
        existingItem.quantity += quantity;
        setItems([...items]);
      } else {
        setItems([...items, new Cart(product, quantity)]);
      }

      openDrawer();
    },
    [items, openDrawer],
  );

  const removeItem = useCallback(
    (product: Product) => {
      setItems(items.filter((item) => item.product.id !== product.id));
    },
    [items],
  );

  const updateItemQuantity = useCallback(
    (product: Product, quantity: number) => {
      const item = items.find((item) => item.product.id === product.id);
      if (item) {
        item.quantity = quantity;
        setItems([...items]);
      }
    },
    [items],
  );

  const registerSale = useCallback(() => {
    fetch("/api/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "test" + Date.now(),
        phone: "123456789",
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      }),
    });
  }, [items]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      return;
    }

    const cart = localStorage.getItem("cart");
    if (cart) {
      setItems(JSON.parse(cart).map(Cart.fromJSON));
    }

    isMounted.current = true;
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      return;
    }

    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        drawerOpen,
        openDrawer,
        closeDrawer,
        registerSale,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  return useContext(CartContext);
};
