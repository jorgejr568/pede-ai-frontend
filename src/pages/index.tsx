import { CartDrawer, Footer, Main, Navbar, ProductCard } from "@/components";
import { getProducts, Product, TProduct } from "@/API/products";
import { GetServerSideProps } from "next";
import { useMemo } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { General, getGeneral, TGeneral } from "@/API";
import Head from "next/head";
import { ENV } from "@/lib/utils";

type HomePageProps = {
  products: TProduct[];
  general: TGeneral;
};

export default function Home(props: HomePageProps) {
  const products = useMemo<Product[]>(
    () => props.products.map((product) => Product.fromJSON(product)),
    [props.products],
  );
  const general = useMemo<General>(
    () => General.fromJSON(props.general),
    [props.general],
  );

  return (
    <>
      <Head>
        <title>
          {ENV.CLIENT_NAME} | {ENV.APP_NAME}
        </title>
      </Head>
      <SessionProvider>
        <CartProvider config={general}>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <Main className="relative">
              <div className="flex flex-col gap-8">
                <h2 className="text-3xl md:text-6xl font-bold">
                  {ENV.CLIENT_NAME}
                </h2>

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
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  HomePageProps
> = async () => {
  const products = await getProducts();
  const general = await getGeneral();
  return {
    props: {
      products: products.map((product) => product.toJSON()),
      general: general.toJSON(),
    },
  };
};
