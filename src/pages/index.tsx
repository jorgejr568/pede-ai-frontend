import { CartDrawer, Footer, Main, Navbar, ProductCard } from "@/components";
import { Category, getProducts, Product, TProduct } from "@/API/products";
import { GetServerSideProps } from "next";
import { useMemo } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { General, getGeneral, TGeneral } from "@/API";
import Head from "next/head";
import { ENV } from "@/lib/utils";
import { groupBy, orderBy } from "lodash";

type HomePageProps = {
  products: TProduct[];
  general: TGeneral;
};

export default function Home(props: HomePageProps) {
  const categories = useMemo<
    { category: Category; products: Product[] }[]
  >(() => {
    const products = props.products.map((product) => Product.fromJSON(product));
    const grouped = groupBy(products, (product) => product.category.id);

    const orderedGroups: { category: Category; products: Product[] }[] = [];
    orderBy(Object.keys(grouped), (k) => grouped[k][0].category.order).forEach(
      (key) => {
        orderedGroups.push({
          category: Category.fromJSON(grouped[key][0].category),
          products: grouped[key],
        });
      },
    );

    return orderedGroups;
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

                {categories.map(({ category, products }) => (
                  <div key={category.id} className="my-6">
                    <h3 className="text-1xl md:text-2xl font-bold text-primary text-left mb-6">
                      {category.name}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-6">
                      {products.map((product) => (
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
