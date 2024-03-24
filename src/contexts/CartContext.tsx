import { General, Product, TProduct } from "@/API";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getLiquid, getSalutation } from "@/lib/utils";

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

type CartContextConfig = {
  phone_number: string;
  sale_message_template: string;
};

type CartContextType = {
  items: Cart[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (product: Product) => void;
  updateItemQuantity: (product: Product, quantity: number) => void;

  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  registerSale: () => Promise<void>;
  clearCart: () => void;
  itemsTotalPrice: number;
  itemsTotalCount: number;
  sendToWhatsApp: () => Promise<void>;
};

export const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateItemQuantity: () => {},
  drawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  registerSale: async () => {},
  clearCart: () => {},
  itemsTotalPrice: 0,
  itemsTotalCount: 0,
  sendToWhatsApp: async () => {},
});

export const CartProvider = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config: General;
}) => {
  const isMounted = useRef(false);
  const configSaleMessageTemplate = useMemo(
    () => getLiquid().parse(config.sale_message_template),
    [config.sale_message_template],
  );
  const [items, setItems] = useState<Cart[]>([]);
  const itemsTotalPrice = useMemo(
    () =>
      items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [items],
  );
  const itemsTotalCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );

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

  const registerSale = useCallback(async () => {
    const response = await fetch("/api/sales", {
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

    if (!response.ok) {
      throw new Error("Failed to register sale " + response.statusText);
    }
  }, [items]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const sendToWhatsApp = useCallback(async () => {
    const message = await getLiquid().render(configSaleMessageTemplate, {
      salutation: getSalutation(),
      items: items.map((item) => item.toJSON()),
      total: itemsTotalPrice,
    });

    const url = `https://api.whatsapp.com/send?phone=${config.phone_number}&text=${encodeURIComponent(
      message,
    )}`;

    window.open(url, "_blank");
  }, [config, configSaleMessageTemplate, itemsTotalPrice, items]);

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
        itemsTotalPrice,
        itemsTotalCount,
        sendToWhatsApp,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  return useContext(CartContext);
};
