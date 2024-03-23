import { Inter } from "next/font/google";
import { CartDrawer, Footer, Main, Navbar, ProductCard } from "@/components";
import { getProducts, Product, TProduct } from "@/API/products";
import { GetServerSideProps } from "next";
import { useMemo } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

const inter = Inter({ subsets: ["latin"] });

type HomePageProps = {
  products: TProduct[];
};

export default function Home(props: HomePageProps) {
  const products: Product[] = useMemo(
    () => props.products.map((product) => Product.fromJSON(product)),
    [props.products],
  );

  return (
    <SessionProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Main className="relative">
            <div className="flex flex-col gap-8">
              <h2 className="text-6xl font-bold">Bem vindo a Wagner Pastéis</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-6">
                {products.map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
              </div>
            </div>
          </Main>
          <Footer />
        </div>
        <CartDrawer />
      </CartProvider>
    </SessionProvider>
  );
}

export const getServerSideProps: GetServerSideProps<
  HomePageProps
> = async () => {
  const products = await getProducts();
  return {
    props: {
      products: products.map((product) => product.toJSON()),
    },
  };
};
