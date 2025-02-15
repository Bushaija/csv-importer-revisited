import * as zod from "zod";
import { relations } from "drizzle-orm";
import { doublePrecision, integer, pgEnum, pgTable, serial, timestamp, varchar, text, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const statusEnum = pgEnum("status", ["PLANNED", "APPROVED", "REJECTED", "SUBMITTED", "COMPLETED"])
export const shipmentEnum = pgEnum("shipment_status", ['ORDERED', 'PLANNED', 'CANCELLED', 'RECEIVED', 'HOLD', 'PARTIAL RECEIVED'])


// purchase order table

export const purchaseOrderTable = pgTable("purchase_order", {
  id: serial("id").primaryKey(),
  // TODO: Remove itemType
  // itemType: varchar("item_type", { length: 255 }),
  category: varchar("category", { length: 255 }).notNull(),
  plannedUnit: varchar("planned_unit", { length: 255 }).notNull(),
  allocationDepartment: varchar("allocation_department", { length: 255 }).notNull(),
  packSize: varchar("pack_size", { length: 255 }).notNull(),
  plannedOrderDate: date("planned_order_date").notNull(),
  plannedDeliveryDate: date("planned_delivery_date").notNull(),
  plannedQuantity: integer("planned_quantity").notNull(),
  revisedQuantity: integer("revised_quantity").default(0),
  secondReview: integer("second_review").default(0),
  unitCost: numeric("unit_cost").notNull(),
  totalCost: doublePrecision("total_cost"),
  fundingSource: varchar("funding_source", { length: 255 }),
  status: statusEnum().default("PLANNED"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});


export const selectPurchaseOrdersSchema = createSelectSchema(purchaseOrderTable);
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrderTable).omit({
    id: true, 
    createdAt: true,
    updatedAt: true,
  });
// custom types
export type TSelectPurchaseOrderSchema = zod.infer<typeof selectPurchaseOrdersSchema>;

export type TInsertPurchaseOrderSchema = zod.infer<typeof insertPurchaseOrderSchema>;

export type PurchaseOrder = typeof purchaseOrderTable.$inferSelect
export type NewPurchaseOrder = typeof purchaseOrderTable.$inferInsert