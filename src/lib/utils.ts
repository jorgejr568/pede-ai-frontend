import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Event } from "@/API/events";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function moneyBrl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export const ENV = Object.freeze({
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Pede Aí",
  STRAPI_URL: process.env.STRAPI_URL,
  STRAPI_TOKEN: process.env.STRAPI_TOKEN,
});

export function registerEvent(event: Event) {
  fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event.toJSON()),
  })
    .then((response) => {
      if (!response.ok) {
        console.warn("Failed to register event", response.statusText);
      }
    })
    .catch((error) => {
      console.warn("Failed to register event", error.message);
    });
}
