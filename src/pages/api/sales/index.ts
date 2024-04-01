import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { createSale } from "@/API";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    return await _POST(req, res);
  }

  res.status(405).send("Method not allowed");
}

const schema = z.object({
  address: z.string(),
  items: z.array(
    z.object({
      product_id: z.number().int().positive(),
      quantity: z.number().int().positive().min(1),
    }),
  ),
});

export type SaleRequest = z.infer<typeof schema>;

async function _POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    await createSale(schema.parse(req.body));
    res.status(201).end();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(500).end();
  }
}
