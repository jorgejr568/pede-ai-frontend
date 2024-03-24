import { ENV } from "@/lib/utils";

type CoverImage = {
  thumbnail?: string;
  small: string | null;
  medium: string | null;
  large: string | null;
  original: string;
};

export type TProduct = {
  id: number;
  category: string;
  name: string;
  price: number;
  active: boolean;
  cover_image: CoverImage;
};

export class Product {
  constructor(private readonly _props: TProduct) {}

  get id(): number {
    return this._props.id;
  }

  get name(): string {
    return this._props.name;
  }

  get category(): string {
    return this._props.category;
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
      category: data.attributes.category,
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
      category: this.category,
      price: this.price,
      active: this.active,
      cover_image: this.cover_image,
    };
  }
}

export async function getProducts(): Promise<Product[]> {
  const url = new URL(ENV.STRAPI_URL + "/api/products");
  url.searchParams.append("sort", "name:asc");
  url.searchParams.append("pagination[pageSize]", "100");
  url.searchParams.append("pagination[page]", "1");
  url.searchParams.append("filter[active]", "true");
  url.searchParams.append("populate", "cover_image");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${ENV.STRAPI_TOKEN}`,
    },
  });
  if (!response.ok) {
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
