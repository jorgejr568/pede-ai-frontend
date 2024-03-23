import { EventType, Product, Event } from "@/API";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { moneyBrl, registerEvent } from "@/lib/utils";
import { QuantityControl } from "@/components/QuantityControl";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "@/contexts/SessionContext";

type ProductCardProps = {
  product: Product;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const { sessionID } = useSession();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addItem(product, quantity);
    registerEvent(
      Event.new(
        EventType.ADD_TO_CART,
        { product: product.toJSON(), quantity },
        sessionID,
      ),
    );
    setQuantity(1);
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4 items-center">
        <div
          style={{
            backgroundImage: `url("${product.cover_image.thumbnail || product.cover_image.original}")`,
          }}
          className="h-56 w-56 bg-cover bg-center"
        />
        <div className="py-4">
          <h2 className="text-lg font-bold">{product.name}</h2>
          <p className="text-slate-600">{moneyBrl(product.price)}</p>

          <div className="mt-2">
            <QuantityControl value={quantity} onChange={setQuantity} />
            <Button className="mt-4" onClick={handleAddToCart}>
              Adicionar ao carrinho
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
