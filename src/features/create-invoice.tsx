"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import PdfDocument from "./pdf-document";
import Image from "next/image";

import { z } from "zod";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

// Validation Schemas
const detailsSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice Number is required"),
  date: z.string().min(1, "Date is required"),
  billTo: z.string().min(1, "Bill To is required"),
  address: z.string().min(1, "Address is required"),
});

const itemsSchema = z.array(
  z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    price: z.number().min(0, "Price must be non-negative"),
  })
);

// HelperText Component
function HelperText({
  children,
  show,
}: {
  children: React.ReactNode;
  show: boolean;
}) {
  return show ? <p className="text-sm text-red-500">{children}</p> : null;
}

export default function CreateInvoice() {
  const [showPreview, setShowPreview] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, price: 0 },
  ]);
  const [details, setDetails] = useState({
    vatReg: "",
    // vatNumber: "",
    invoiceNumber: "",
    date: new Date().toLocaleDateString(),
    billTo: "",
    address: "",
    notes: "",
  });

  //  default date value
  const today = new Date();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [itemErrors, setItemErrors] = useState<string[][]>([]);

  const validateInputs = () => {
    const detailsResult = detailsSchema.safeParse(details);
    const itemsResult = itemsSchema.safeParse(items);

    const newErrors: { [key: string]: string } = {};
    const newItemErrors: string[][] = items.map(() => []);

    if (!detailsResult.success) {
      detailsResult.error.errors.forEach((err) => {
        if (err.path[0]) newErrors[err.path[0] as string] = err.message;
      });
    }

    if (!itemsResult.success) {
      itemsResult.error.errors.forEach((err) => {
        const index = err.path[0] as number;
        const field = err.path[1] as string;
        if (index !== undefined && field) {
          newItemErrors[index][field] = err.message;
        }
      });
    }

    setErrors(newErrors);
    setItemErrors(newItemErrors);

    return detailsResult.success && itemsResult.success;
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const updateDetails = (field: keyof typeof details, value: string) => {
    setDetails({ ...details, [field]: value });
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal;
  };

  const generatePreview = () => {
    if (validateInputs()) {
      setShowPreview(true);
    }
  };

  return (
    <div className="container mx-auto py-6 flex gap-6 justify-center ">
      <div className="space-y-6 w-full max-w-3xl ">
        {showPreview && (
          <div className="flex justify-center gap-6">
            <Button
              className="w-full max-w-xs"
              onClick={() => setShowPreview(false)}
            >
              Edit
            </Button>
            <Button className="w-full max-w-xs" asChild>
              <PDFDownloadLink
                document={
                  <PdfDocument
                    details={details}
                    items={items}
                    calculateTotal={calculateTotal}
                  />
                }
                fileName={`${details.invoiceNumber}.pdf`}
              >
                {({ loading }) => (loading ? "Loading..." : "Download")}
              </PDFDownloadLink>
            </Button>
          </div>
        )}

        <Card hidden={showPreview}>
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Image
                src="/next.png"
                alt="Invoice Logo"
                width={150}
                height={50}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  placeholder="INV-001"
                  onChange={(e) => {
                    updateDetails("invoiceNumber", e.target.value);
                    setErrors({ ...errors, invoiceNumber: "" });
                  }}
                />
                <HelperText show={!!errors.invoiceNumber}>
                  {errors.invoiceNumber}
                </HelperText>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  defaultValue={today.toISOString().split("T")[0]}
                  onChange={(e) => {
                    updateDetails("date", e.target.value);
                    setErrors({ ...errors, date: "" });
                  }}
                />
                <HelperText show={!!errors.date}>{errors.date}</HelperText>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatReg">VAT Reg No</Label>
                <Input
                  id="vatReg"
                  placeholder=""
                  onChange={(e) => {
                    updateDetails("vatReg", e.target.value);
                    setErrors({ ...errors, vatReg: "" });
                  }}
                />
                <HelperText show={!!errors.vatReg}>{errors.vatReg}</HelperText>
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="vatNumber">VAT No</Label>
                <Input
                  id="vatNumber"
                  placeholder=""
                  onChange={(e) => {
                    updateDetails("vatNumber", e.target.value);
                    setErrors({ ...errors, vatNumber: "" });
                  }}
                />
                <HelperText show={!!errors.vatNumber}>
                  {errors.vatNumber}
                </HelperText>
              </div> */}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Bill To</Label>
              <Input
                placeholder="Client Name"
                onChange={(e) => {
                  updateDetails("billTo", e.target.value);
                  setErrors({ ...errors, billTo: "" });
                }}
              />
              <HelperText show={!!errors.billTo}>{errors.billTo}</HelperText>
              <Textarea
                placeholder="Billing Address"
                onChange={(e) => {
                  updateDetails("address", e.target.value);
                  setErrors({ ...errors, address: "" });
                }}
              />
              <HelperText show={!!errors.address}>{errors.address}</HelperText>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-4 md:grid-cols-[1fr,auto,auto,auto]"
                >
                  <div>
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => {
                        updateItem(index, "description", e.target.value);
                        setItemErrors(itemErrors.map(() => ({})));
                      }}
                    />
                    <HelperText show={!!itemErrors[index]?.description}>
                      {itemErrors[index]?.description}
                    </HelperText>
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        updateItem(index, "quantity", parseInt(e.target.value));
                        setItemErrors(itemErrors.map(() => ({})));
                      }}
                      className="w-20"
                    />
                    <HelperText show={!!itemErrors[index]?.quantity}>
                      {itemErrors[index]?.quantity}
                    </HelperText>
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => {
                        updateItem(index, "price", parseFloat(e.target.value));
                        setItemErrors(itemErrors.map(() => ({})));
                      }}
                      step="0.01"
                      className="w-24"
                    />
                    <HelperText show={!!itemErrors[index]?.price}>
                      {itemErrors[index]?.price}
                    </HelperText>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                onChange={(e) => updateDetails("notes", e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-end gap-4">
            <div className="w-full max-w-xs space-y-2">
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full max-w-xs" onClick={generatePreview}>
              Generate Preview
            </Button>
          </CardFooter>
        </Card>

        {showPreview && (
          <div className="w-full">
            <PDFViewer width="100%" height="800px">
              <PdfDocument
                details={details}
                items={items}
                calculateSubtotal={calculateSubtotal}
                calculateTotal={calculateTotal}
              />
            </PDFViewer>
          </div>
        )}
      </div>

      {/* <div className="w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[8.5/11] bg-muted rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <h2 className="font-bold text-2xl">INVOICE</h2>
                    <p className="text-sm text-muted-foreground">
                      #{items[0].description || "INV-001"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Total Due</p>
                    <p className="text-2xl font-bold">
                      ${calculateTotal().toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-medium">Bill To</p>
                  <p className="text-sm text-muted-foreground">Client Name</p>
                  <p className="text-sm text-muted-foreground">
                    Billing Address
                  </p>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Description</th>
                      <th className="py-2 text-right">Qty</th>
                      <th className="py-2 text-right">Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">
                          {item.description || "Item description"}
                        </td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="py-2 text-right">
                          ${(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
