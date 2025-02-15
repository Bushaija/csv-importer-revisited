"use client"

import * as React from "react"

import { dataConfig, type DataConfig } from "@/config/data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CsvImporter } from "./csv-import"

import { useBulkCreateTransactions } from "@/features/api/use-create-bulk-transactions"
import { useGetTransactions } from "@/features/api/use-get-transactions"
import { TInsertPurchaseOrderSchema } from "@/db/schema"
import { z } from "zod";


// Define a strict schema for validation
const orderSchema = z.object({
  category: z.string().min(1, "Category is required"),
  plannedUnit: z.string().min(1, "Planned Unit is required"),
  allocationDepartment: z.string().min(1, "Allocation Department is required"),
  packSize: z.string().min(1, "Pack Size is required"),
  plannedOrderDate: z.string().min(1, "Planned Order Date is required"),
  plannedDeliveryDate: z.string().min(1, "Planned Delivery Date is required"),
  plannedQuantity: z.number().min(0).nullable(),
  revisedQuantity: z.number().min(0).nullable(),
  secondReview: z.number().min(0, "Second Review is required"),
  unitCost: z.string().min(1, "Unit Cost is required"),
  totalCost: z.number().min(0, "Total Cost is required"),
  fundingSource: z.string().min(1, "Funding Source is required"),
  status: z.enum(["PLANNED", "APPROVED", "REJECTED", "SUBMITTED", "COMPLETED"]).default("PLANNED"),
});




export function TricksTable() {
  const [data, setData] = React.useState<TInsertPurchaseOrderSchema[]>([])
  const createTransactions = useBulkCreateTransactions();
  const transactionsQuery = useGetTransactions();
  const transactions = transactionsQuery.data || [];

  const isDisabled =
    transactionsQuery.isLoading;

  React.useEffect(() => {
    if (transactions.length > 0) {
      setData(transactions);
    }
  }, [transactions]);

  
  
  return (
    <div className="flex flex-col gap-4">
      <CsvImporter
        fields={[
          { label: "item_name", value: "item_name", required: true},
          { label: "item_category", value: "item_category", required: true},
          { label: "department", value: "department", required: true},
          { label: "pack_size", value: "pack_size", required: true},
          { label: "planned_order_date", value: "planned_order_date", required: true},
          { label: "planned_delivery_date", value: "planned_delivery_date", required: true},
          { label: "planned_quantity", value: "planned_quantity", required: true},
          { label: "revised_quantity", value: "revised_quantity", required: true},
          { label: "second_quantity", value: "second_quantity", required: true},
          { label: "unit_cost", value: "unit_cost", required: true},
          { label: "total_cost", value: "total_cost", required: true},
          { label: "funding_source", value: "funding_source", required: true},
          { label: "status", value: "status", required: true},
        ]}

        onImport={
          (parsedData: any[]) => {
            const filteredData = parsedData.filter(row =>
              Object.values(row).some(value => value !== "" && value !== null)
            );
          
            console.log("Filtered Data:", filteredData); // Debugging step

            let errorMessages: string[] = [];
          
            // Validate each row using Zod
            const validatedData = filteredData.map((item, index) => {
              const result = orderSchema.safeParse({
                category: item.category || "",
                plannedUnit: item.plannedUnit || "",
                allocationDepartment: item.allocationDepartment || "",
                packSize: item.packSize || "",
                plannedOrderDate: item.plannedOrderDate || "",
                plannedDeliveryDate: item.plannedDeliveryDate || "",
                plannedQuantity: Number(item.plannedQuantity) || 0,
                revisedQuantity: item.revisedQuantity ? Number(item.revisedQuantity) : 0, // Convert empty to null
                secondReview: item.secondReview ? Number(item.secondReview) : 0,
                unitCost: String(item.unitCost) || "",
                totalCost: Number(item.totalCost) || 0,
                fundingSource: item.fundingSource || "",
                status: item.status || "PLANNED",
              });
          
              if (!result.success) {
                const fieldErrors = Object.entries(result.error.format())
                    .map(([field, error]) => `${field}: ${Array.isArray(error) ? error.join(", ") : error._errors.join(", ")}`)
                    .join(" | ");
                    errorMessages.push(`Row ${index + 1}: ${fieldErrors}`);
                return null; // Skip invalid rows
              }
          
              return result.data;
            }).filter(Boolean); // Remove null values
          
            console.log("Validated Data:", validatedData); // Debugging step
          
            if (validatedData.length === 0) {
              alert(`Import failed! The following errors were found:\n\n${errorMessages.join("\n")}`);
              return;
            }

            setData((prev) => [...prev, ...validatedData as TInsertPurchaseOrderSchema[]])

            createTransactions.mutate(validatedData as TInsertPurchaseOrderSchema[], {
              onSuccess: () => {
                console.log("Transactions successfully created!")
              },
              onError: (error) => {
                console.error("Error creating transactions:", error)
              },
            })
          }


        }
        className="self-end"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>id</TableHead>
              <TableHead>category</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Pack size</TableHead>
              <TableHead>Pl. Order Date</TableHead>
              <TableHead>Pl. Delivery Date</TableHead>
              <TableHead>Pl. Quantity</TableHead>
              <TableHead>Second Review</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Funding Source</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <span className="line-clamp-1">{item.id}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.category}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.plannedUnit}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.allocationDepartment}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.packSize}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.plannedOrderDate}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.plannedDeliveryDate}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.plannedQuantity}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.secondReview}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.unitCost}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.totalCost}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.fundingSource}</span>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-1">{item.status}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}