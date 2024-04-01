import { type ClassValue, clsx } from "clsx";
import { Liquid } from "liquidjs";
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
  CLIENT_NAME: process.env.NEXT_PUBLIC_CLIENT_NAME || "Wagner Pastéis",
  STRAPI_URL: process.env.STRAPI_URL,
  STRAPI_TOKEN: process.env.STRAPI_TOKEN,
  BRASIL_API_URL: process.env.BRASIL_API_URL || "https://brasilapi.com.br",
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

let _liquid: Liquid | null = null;
export function getLiquid() {
  if (!_liquid) {
    _liquid = new Liquid({
      trimTagLeft: true,
    });
    _liquid.registerFilter("money", moneyBrl);
  }

  return _liquid;
}

export function getSalutation() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Bom dia";
  }
  if (hour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

export function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const CATEGORY_ORDER = ["SALGADOS", "DOCES", "ESPECIAIS", "BEBIDAS"];
