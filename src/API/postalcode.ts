import { ENV } from "@/lib/utils";

type PostalCode = {
  postalCode: string;
  city: string;
  state: string;
  neighborhood: string;
  street: string;
};

export async function getPostalCode(postalCode: string): Promise<PostalCode> {
  const sanitizedPostalCode = postalCode.replace(/\D/g, "").slice(0, 8);
  console.log(sanitizedPostalCode);
  if (sanitizedPostalCode.length !== 8) {
    throw new Error("Invalid postal code");
  }

  const formattedPostalCode = `${sanitizedPostalCode.slice(0, 5)}-${sanitizedPostalCode.slice(5)}`;

  const response = await fetch(
    `${ENV.BRASIL_API_URL}/api/cep/v1/${formattedPostalCode}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch postal code");
  }

  return response.json();
}
