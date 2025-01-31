import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { SVGProps, useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { moneyBrl, registerEvent } from "@/lib/utils";
import { QuantityControl } from "@/components/QuantityControl";
import { Event, EventType, Product } from "@/API";
import { useSession } from "@/contexts/SessionContext";
import { AddressModal } from "@/components/AddressModal";
import {
  PaymentMethod,
  PaymentMethodModal,
} from "@/components/PaymentMethodModal";

export const CartDrawer = () => {
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const addressRef = useRef<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const { sessionID } = useSession();

  const {
    items,
    itemsTotalPrice,
    drawerOpen,
    closeDrawer,
    openDrawer,
    updateItemQuantity,
    removeItem,
    registerSale,
    clearCart,
    sendToWhatsApp,
  } = useCart();

  const handleFinishSale = () => {
    setAddressModalOpen(true);
  };

  const handleQuantityChange = (product: Product) => (quantity: number) => {
    const requireDeletion = quantity <= 0;
    const eventType = requireDeletion
      ? EventType.REMOVE_FROM_CART
      : EventType.UPDATE_CART;

    registerEvent(
      Event.new(
        eventType,
        {
          product: product.toJSON(),
          quantity,
          origin: "CartDrawer",
        },
        sessionID,
      ),
    );

    if (requireDeletion) {
      return removeItem(product);
    }

    updateItemQuantity(product, quantity);
  };

  const handleAddressConfirm = async (address: string) => {
    addressRef.current = address;

    registerEvent(
      Event.new(
        EventType.FILLED_ADDRESS,
        {
          total: itemsTotalPrice,
          items: items.map((item) => item.toJSON()),
          origin: "CartDrawer",
          address,
        },
        sessionID,
      ),
    );

    setAddressModalOpen(false);
    setPaymentModalOpen(true);
  };

  const handlePaymentMethodConfirm = async (paymentMethod: PaymentMethod) => {
    registerEvent(
      Event.new(
        EventType.REGISTER_SALE,
        {
          address: addressRef.current,
          total: itemsTotalPrice,
          items: items.map((item) => item.toJSON()),
          origin: "CartDrawer",
          paymentMethod,
        },
        sessionID,
      ),
    );
    await registerSale(addressRef.current as string, paymentMethod);
    clearCart();
    closeDrawer();
    setPaymentModalOpen(false);
    sendToWhatsApp(addressRef.current as string, paymentMethod);
  };

  return (
    <Drawer
      open={drawerOpen}
      onOpenChange={(open) => (open ? openDrawer() : closeDrawer())}
    >
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-3xl border-b pb-2 text-center">
              Seu carrinho
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <Table className="mt-3">
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.product.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>
                      <QuantityControl
                        allowZero
                        value={item.quantity}
                        onChange={handleQuantityChange(item.product)}
                      />
                    </TableCell>
                    <TableCell>
                      {moneyBrl(item.product.price * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell>{moneyBrl(itemsTotalPrice)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          <DrawerFooter>
            <Button onClick={handleFinishSale}>
              <WhatsappIcon className="text-white h-4 w-4 mr-2" />
              Finalizar compra
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Continuar comprando</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
      <AddressModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onConfirm={handleAddressConfirm}
      />
      <PaymentMethodModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onConfirm={handlePaymentMethodConfirm}
      />
    </Drawer>
  );
};

const WhatsappIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
};
