import { ENV } from "@/lib/utils";
import qs from "qs";

type CoverImage = {
  thumbnail?: string;
  small: string | null;
  medium: string | null;
  large: string | null;
  original: string;
};

export type TCategory = {
  id: number;
  name: string;
  order: number;
};

export class Category {
  constructor(private readonly _props: TCategory) {}

  get id(): number {
    return this._props.id;
  }

  get name(): string {
    return this._props.name;
  }

  get order(): number {
    return this._props.order;
  }

  static fromJSON(data: TCategory): Category {
    return new Category(data);
  }

  public toJSON(): TCategory {
    return {
      id: this.id,
      name: this.name,
      order: this.order,
    };
  }

  static fromStrapi(data: any): Category {
    return new Category({
      id: data.id,
      name: data.attributes.name,
      order: data.attributes.order,
    });
  }
}

export type TProduct = {
  id: number;
  category: TCategory;
  name: string;
  price: number;
  active: boolean;
  cover_image: CoverImage;
};

export class Product {
  private _category: Category | undefined;
  constructor(private readonly _props: TProduct) {}

  get id(): number {
    return this._props.id;
  }

  get name(): string {
    return this._props.name;
  }

  get category(): Category {
    if (!this._category) {
      this._category = Category.fromJSON(this._props.category);
    }

    return this._category;
  }

  get price(): number {
    return this._props.price;
  }

  get active(): boolean {
    return this._props.active;
  }

  get cover_image(): CoverImage {
    return this._props.cover_image;
  }

  static fromStrapi(data: any): Product {
    return new Product({
      id: data.id,
      name: data.attributes.name,
      category: Category.fromStrapi(data.attributes.category.data).toJSON(),
      price: data.attributes.price,
      active: data.attributes.active,
      cover_image: coverImageUrl(data.attributes.cover_image),
    });
  }

  public static fromJSON(data: TProduct): Product {
    return new Product(data);
  }

  public toJSON(): TProduct {
    return {
      id: this.id,
      name: this.name,
      category: this.category.toJSON(),
      price: this.price,
      active: this.active,
      cover_image: this.cover_image,
    };
  }
}

export async function getProducts(): Promise<Product[]> {
  const url = new URL(ENV.STRAPI_URL + "/api/products");

  url.search = qs.stringify(
    {
      sort: "name:asc",
      filters: {
        active: true,
        category: {
          id: {
            $notNull: true,
          },
        },
        cover_image: {
          id: {
            $notNull: true,
          },
        },
      },
      pagination: {
        pageSize: 100,
        page: 1,
      },
      populate: ["category", "cover_image"],
    },
    {
      encodeValuesOnly: true,
    },
  );

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${ENV.STRAPI_TOKEN}`,
    },
  });

  if (!response.ok) {
    console.error(
      `Failed to fetch products: ${response.statusText}`,
      JSON.stringify(await response.json()),
    );
    throw new Error(response.statusText);
  }

  const data = await response.json();
  return data.data.map(Product.fromStrapi);
}

function coverImageUrl(image: any): CoverImage {
  const prefix = ENV.STRAPI_URL;
  const formats = image.data.attributes.formats;
  return {
    thumbnail: (formats?.thumbnail && prefix + formats?.thumbnail?.url) || null,
    small: (formats?.small && prefix + formats?.small?.url) || null,
    medium: (formats?.medium && prefix + formats?.medium?.url) || null,
    large: (formats?.large && prefix + formats?.large?.url) || null,
    original: prefix + image.data.attributes.url,
  };
}
