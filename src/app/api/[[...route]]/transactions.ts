import { any, z } from "zod";
import { Hono } from "hono";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator"; 
import { createId } from "@paralleldrive/cuid2";

import { db } from "@/db";
import {
  insertPurchaseOrderSchema,
  purchaseOrderTable,
  TInsertPurchaseOrderSchema,
  TSelectPurchaseOrderSchema,
} from "@/db/schema";


const app = new Hono()
.get(
  "/",
  async (c) => {
    const data = await db
      .select()
      .from(purchaseOrderTable)

    return c.json({
      data,
    });
  },
)
.post(
    "/bulk-create",
    zValidator("json", z.array(insertPurchaseOrderSchema)),
    async (c) => {
      const values = c.req.valid("json");

      console.log("server2:", values);

      const data = await db
        .insert(purchaseOrderTable)
        .values(values.map(value => ({
          category: value.category,
          plannedUnit: value.plannedUnit,
          allocationDepartment: value.allocationDepartment,
          packSize: value.packSize,
          plannedOrderDate: value.plannedOrderDate,
          plannedDeliveryDate: value.plannedDeliveryDate,
          plannedQuantity: value.plannedQuantity,
          revisedQuantity: value.revisedQuantity,
          secondReview: value.secondReview,
          unitCost: value.unitCost,
          totalCost: value.totalCost,
          fundingSource: value.fundingSource,
          status: value.status,
        })))
        .returning();

      return c.json({ data });
    },
  );

export default app;

