import { ENV } from "@/lib/utils";

type CoverImage = {
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  original: string;
};

export type TProduct = {
  id: number;
  name: string;
  price: number;
  active: boolean;
  cover_image: CoverImage;
};

export class Product {
  constructor(
    private readonly _id: number,
    private readonly _name: string,
    private readonly _price: number,
    private readonly _active: boolean,
    private readonly _cover_image: CoverImage,
  ) {}

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get price(): number {
    return this._price;
  }

  get active(): boolean {
    return this._active;
  }

  get cover_image(): CoverImage {
    return this._cover_image;
  }

  static fromStrapi(data: any): Product {
    return new Product(
      data.id,
      data.attributes.name,
      data.attributes.price,
      data.attributes.active,
      coverImageUrl(data.attributes.cover_image),
    );
  }

  public static fromJSON(data: TProduct): Product {
    return new Product(
      data.id,
      data.name,
      data.price,
      data.active,
      data.cover_image,
    );
  }

  public toJSON(): any {
    return {
      id: this.id,
      name: this.name,
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

  return {
    thumbnail: prefix + image.data.attributes.formats?.thumbnail?.url,
    small: prefix + image.data.attributes.formats?.small?.url,
    medium: prefix + image.data.attributes.formats?.medium?.url,
    large: prefix + image.data.attributes.formats?.large?.url,
    original: prefix + image.data.attributes.url,
  };
}
