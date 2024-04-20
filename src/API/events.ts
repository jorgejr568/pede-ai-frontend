import { ENV } from "@/lib/utils";

export enum EventType {
  ADD_TO_CART = "ADD_TO_CART",
  REMOVE_FROM_CART = "REMOVE_FROM_CART",
  UPDATE_CART = "UPDATE_CART",
  REGISTER_SALE = "REGISTER_SALE",
  FILLED_ADDRESS = "FILLED_ADDRESS",
  VIEW_CART = "VIEW_CART",
}

type TEvent = {
  event_name: EventType;
  event_properties: Record<string, unknown>;
  session_id: string;
};

export class Event {
  constructor(
    private readonly _event_name: EventType,
    private readonly _event_properties: Record<string, unknown>,
    private readonly _session_id: string,
  ) {}

  toJSON(): TEvent {
    return {
      event_name: this._event_name,
      event_properties: this._event_properties,
      session_id: this._session_id,
    };
  }

  static fromJSON(data: TEvent): Event {
    return new Event(data.event_name, data.event_properties, data.session_id);
  }

  static new(
    event_name: EventType,
    event_properties: Record<string, unknown>,
    session_id: string,
  ): Event {
    return new Event(event_name, event_properties, session_id);
  }
}

export async function createEvent(event: Event): Promise<void> {
  const response = await fetch(ENV.STRAPI_URL + "/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENV.STRAPI_TOKEN}`,
    },
    body: JSON.stringify({
      data: event.toJSON(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create event " + response.statusText);
  }
}
