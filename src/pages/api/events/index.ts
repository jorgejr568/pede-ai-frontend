import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { createEvent, EventType, Event } from "@/API";

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
  event_name: z.string().refine((value) => {
    return Object.values(EventType).includes(value as EventType);
  }),
  event_properties: z.record(z.unknown()),
  session_id: z.string(),
});

export type SaleRequest = z.infer<typeof schema>;

async function _POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = schema.parse(req.body);
    await createEvent(
      Event.fromJSON({
        ...body,
        event_name: body.event_name as EventType,
      }),
    );
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
