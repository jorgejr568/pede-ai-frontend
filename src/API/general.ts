import { ENV } from "@/lib/utils";

export type TGeneral = {
  phone_number: string;
  sale_message_template: string;
};

export class General {
  constructor(private readonly _props: TGeneral) {}

  get phone_number(): string {
    return this._props.phone_number;
  }

  get sale_message_template(): string {
    return this._props.sale_message_template;
  }

  toJSON(): TGeneral {
    return {
      phone_number: this.phone_number,
      sale_message_template: this.sale_message_template,
    };
  }

  static fromJSON(data: TGeneral): General {
    return new General(data);
  }

  static fromStrapi(data: any): General {
    return new General({
      phone_number: data.attributes.phone_number,
      sale_message_template: data.attributes.sale_message_template,
    });
  }
}

export async function getGeneral(): Promise<General> {
  const response = await fetch(`${ENV.STRAPI_URL}/api/general`, {
    headers: {
      Authorization: `Bearer ${ENV.STRAPI_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch general data");
  }

  const { data } = await response.json();
  return General.fromStrapi(data);
}
