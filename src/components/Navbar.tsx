import Link from "next/link";
import Image from "next/image";
import { ENV, registerEvent } from "@/lib/utils";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "@/contexts/SessionContext";
import { Event, EventType } from "@/API";

export function Navbar() {
  const { sessionID } = useSession();
  const cartCtx = useCart();

  const handleOpenCart = () => {
    cartCtx.openDrawer();
    registerEvent(
      Event.new(
        EventType.VIEW_CART,
        {
          origin: "Navbar",
          items: cartCtx.items.map((item) => item.toJSON()),
          total: cartCtx.itemsTotalPrice,
          count: cartCtx.itemsTotalCount,
        },
        sessionID,
      ),
    );
  };

  return (
    <header className="flex h-16 px-4 border-b md:h-20 md:px-6 bg-primary">
      <div className="container flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase">
          <Link className="flex items-center gap-2" href="/">
            <Image
              src="/logo.png"
              alt={ENV.APP_NAME}
              width={90}
              height={90}
              className={`h-16 w-16 md:h-20 md:w-20`}
            />
            <span className="sr-only">{ENV.APP_NAME}</span>
          </Link>
        </div>
        <nav className="flex ml-auto space-x-4">
          <div className="cursor-pointer relative" onClick={handleOpenCart}>
            <ShoppingCartIcon className="h-8 w-8 text-primary-foreground" />
            {cartCtx.itemsTotalCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none transform translate-x-1/2 -translate-y-1/2 bg-primary-foreground text-primary rounded-full">
                {cartCtx.itemsTotalCount}
              </span>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
