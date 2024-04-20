import { CartDrawer, Footer, Main, Navbar, ProductCard } from "@/components";
import { getProducts, Product, TProduct } from "@/API/products";
import { GetServerSideProps } from "next";
import { useMemo } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { General, getGeneral, TGeneral } from "@/API";
import Head from "next/head";
import { ENV, CATEGORY_ORDER } from "@/lib/utils";
import { groupBy, orderBy } from "lodash";
import { AddressModal } from "@/components/AddressModal";

type HomePageProps = {
  products: TProduct[];
  general: TGeneral;
};

export default function Home(props: HomePageProps) {
  const products = useMemo<{ [k: string]: Product[] }>(() => {
    const products = props.products.map((product) => Product.fromJSON(product));
    const grouped = groupBy(products, "category");

    return Object.fromEntries(
      orderBy(Object.entries(grouped), ([category]) =>
        CATEGORY_ORDER.includes(category)
          ? CATEGORY_ORDER.indexOf(category)
          : Infinity,
      ),
    );
  }, [props.products]);

  const general = useMemo<General>(
    () => General.fromJSON(props.general),
    [props.general],
  );

  const title = useMemo<string>(() => {
    return `${ENV.CLIENT_NAME} | ${ENV.APP_NAME}`;
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
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

                {Object.keys(products).map((category) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-1xl md:text-2xl font-bold text-gray-800 mb-3">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-6">
                      {products[category].map((product) => (
                        <ProductCard product={product} key={product.id} />
                      ))}
                    </div>
                  </div>
                ))}
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
