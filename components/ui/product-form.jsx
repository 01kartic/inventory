// ProductForm.jsx
'use client';

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";
import { Button } from "./button";

export default function ProductForm({ 
  initialData = null,
  onSubmit,
  isSubmitting,
  submitButtonText 
}) {
  const router = useRouter();
  
  const form = useForm({
    defaultValues: {
      productName: initialData?.productName || "",
      manufactureCompany: initialData?.manufactureCompany || "",
      size: initialData?.size || "",
      sellingPrice: initialData?.sellingPrice?.toString() || "",
    },
  });

  const handleSubmit = async (data) => {
    try {
      if (!data.productName.trim() || !data.manufactureCompany.trim() || 
          !data.size.trim() || !data.sellingPrice) {
        throw new Error('Please fill in all required fields');
      }
      
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" autoComplete="off">
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="productName"
            rules={{ required: "Product name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="manufactureCompany"
            rules={{ required: "Manufacture company is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacture Company</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="size"
            rules={{ required: "Size is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Size" {...field} />
                </FormControl>
                <FormDescription>
                  Write Product Size like 1kg, 500g, 1L, 500ml etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sellingPrice"
            rules={{ 
              required: "Selling price is required", 
              validate: (value) => parseFloat(value) > 0 || "Price must be greater than 0" 
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Price (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/products')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}