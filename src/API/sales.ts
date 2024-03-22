import type { SaleRequest } from "@/pages/api/sales";
import { getProducts, Product } from "@/API/products";

export async function createSale(sale: SaleRequest): Promise<void> {
  const products = await getProducts();

  const itemsIDs: number[] = [];
  const itemsPromises = [];
  const insertItem = async (
    product: Product,
    saleItem: SaleRequest["items"][number],
  ) => {
    itemsIDs.push(await createSaleProduct(product, saleItem));
  };

  for (const saleItem of sale.items) {
    const product = products.find(
      (product) => product.id === saleItem.product_id,
    );
    if (!product) {
      continue;
      throw new Error("Product not found");
    }

    itemsPromises.push(insertItem(product, saleItem));
  }
  await Promise.all(itemsPromises);

  const response = await fetch(process.env.STRAPI_URL + "/api/sales", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        name: sale.name,
        phone: sale.phone,
        sale_products: itemsIDs,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create sale");
  }
}

async function createSaleProduct(
  product: Product,
  saleItem: SaleRequest["items"][number],
): Promise<number> {
  const response = await fetch(process.env.STRAPI_URL + "/api/sale-products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        ...saleItem,
        unit_price: product.price,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create sale product");
  }

  const data = await response.json();
  return data.data.id;
}
