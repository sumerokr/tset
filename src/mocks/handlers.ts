import { rest } from "msw";
import type { PriceEntry } from "@/App.vue";

let priceEntries: PriceEntry[] = [
  {
    id: "baseline",
    label: "baseline",
    value: 1,
  },
];

// TODO: add types to API mocks
export const handlers = [
  rest.get("/getPriceComponents", (req, res, ctx) => {
    return res(ctx.delay(), ctx.status(200), ctx.json(priceEntries));
  }),

  rest.post("/postPriceComponents", async (req, res, ctx) => {
    const _priceEntries = (await req.json()) as PriceEntry[];
    priceEntries = _priceEntries;
    return res(ctx.delay(), ctx.status(200), ctx.json(priceEntries));
  }),

  rest.put("/putPriceComponent", async (req, res, ctx) => {
    const priceEntry: PriceEntry = await req.json();
    const exists = priceEntries.some(({ id }) => id === priceEntry.id);
    if (!exists) {
      priceEntries.push(priceEntry);
    }
    return res(ctx.delay(), ctx.status(200), ctx.json(priceEntries));
  }),

  rest.delete("/deletePriceComponent", async (req, res, ctx) => {
    const priceEntry: PriceEntry = await req.json();
    const index = priceEntries.findIndex(({ id }) => id === priceEntry.id);
    if (index !== -1) {
      priceEntries.splice(index, 1);
      return res(ctx.delay(), ctx.status(200), ctx.json(priceEntries));
    } else {
      return res(
        ctx.delay(),
        ctx.status(403),
        ctx.json({
          error: `priceEntry '${priceEntry.id}' not found`,
        })
      );
    }
  }),
];
