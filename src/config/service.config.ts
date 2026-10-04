export type ServicePriceType = "hourly" | "daily" | "one-time";

export type ServiceConfig = {
  // Titles, descriptions and feature lists live in the "service" messages (items.<id>)
  id: string;
  price: number;
  priceType: ServicePriceType;
  duration?: number;
  durationUnit?: "hour" | "day";
  phone?: string;
  telegram?: string;
};

export const services: ServiceConfig[] = [
  { id: "service-1", price: 50_000, priceType: "hourly", duration: 1, durationUnit: "hour" },
  { id: "service-2", price: 350_000, priceType: "daily", duration: 8, durationUnit: "hour" },
  { id: "service-3", price: 150_000, priceType: "one-time" },
  { id: "service-4", price: 80_000, priceType: "hourly", duration: 1, durationUnit: "hour" },
  // phone / telegram on a card adds its own "Contact" button
  { id: "service-5", price: 250_000, priceType: "one-time", telegram: "username" },
];

// TODO: replace the placeholders below with the real contacts
export const serviceContacts = {
  phones: ["+998 90 123 45 67", "+998 91 765 43 21"],
  telegram: "username",
};
