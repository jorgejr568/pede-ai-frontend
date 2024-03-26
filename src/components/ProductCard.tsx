import { EventType, Product, Event } from "@/API";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { moneyBrl, registerEvent } from "@/lib/utils";
import { QuantityControl } from "@/components/QuantityControl";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "@/contexts/SessionContext";
import Image from "next/image";

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
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full h-56 md:w-56 relative">
          <Image
            src={product.cover_image.medium || product.cover_image.original}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            className="bg-cover bg-center"
          />
        </div>
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
