import type { SaleRequest } from "@/pages/api/sales";
import { getProducts, Product } from "@/API/products";
import { ENV } from "@/lib/utils";

type TItem = {
  product: number;
  quantity: number;
  price: number;
};

export async function createSale(sale: SaleRequest): Promise<void> {
  const products = await getProducts();
  const body = {
    name: sale.name,
    phone: sale.phone,
    items: sale.items.map((item): TItem => {
      const product = products.find(
        (product) => product.id === item.product_id,
      );
      if (!product) {
        throw new Error("Product not found");
      }

      return {
        product: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    }),
  };

  const response = await fetch(ENV.STRAPI_URL + "/api/sales", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.STRAPI_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: body,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create sale ");
  }
}
