'use client';

import { Button } from "./button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Calendar } from "./calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Input } from "./input";
import { useForm } from "react-hook-form";
import { CalendarBlank, CaretDown, Check } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import Loading from "./loading";

export default function StockForm({
  onSubmit,
  initialData = null,
  isSubmitting = false,
  onCancel
}) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      productId: "",
      dealerName: "",
      buyingPrize: "",
      quantity: "",
      billNumber: "",
      lotNumber: "",
      receivedDate: "",
      ...initialData
    },
  });

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch products');
        }

        setProducts(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error("Failed to load products data");
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const getProductDisplay = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return "";
    return (
      <div className="text-start">
        <p>{product.productName}</p>
        <small className="text-stone-500">{product.manufactureCompany} | {product.size} | ₹{product.sellingPrice}</small>
      </div>
    );
  };

  const handleProductSelect = (value,) => {
    form.setValue(`productId`, value);
  };

  const isEditing = !!initialData;

  if (isLoading) {
    return <Loading type="color" />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name={`productId`}
            rules={{ required: "Product selection is required" }}
            render={({ field: productField }) => (
              <FormItem className="flex flex-col">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full h-14 justify-between",
                          !productField.value && "text-muted-foreground"
                        )}
                      >
                        {productField.value
                          ? getProductDisplay(productField.value)
                          : "Select product"}
                        <CaretDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] ```javascript
                                                                p-0">
                    <Command>
                      <CommandInput placeholder="Search product" />
                      <CommandList>
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup>
                          {products.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={`${product.productName} ${product.manufactureCompany} ${product.size}`}
                              onSelect={() => {
                                handleProductSelect(product.id);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  product.id === productField.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {getProductDisplay(product.id)}
                            </CommandItem>
                          )
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dealerName"
            rules={{ required: "Dealer Name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dealer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter dealer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="buyingPrize"
            rules={{ required: "Buying Prize is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buying Prize</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter buying prize" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            rules={{ required: "Quantity is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter quantity" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="billNumber"
            rules={{ required: "Bill Number is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bill Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter bill number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lotNumber"
            rules={{ required: "Lot Number is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lot Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter lot number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="receivedDate"
            rules={{ required: "Recieved Date is required" }}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Recieved Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"}>
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarBlank className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(field.value)}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2000-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loading />
                {isEditing ? "Updating..." : "Adding..."}
              </>
            ) : (isEditing ? "Save Changes" : "Add New")}
          </Button>
        </div>
      </form>
    </Form>
  );
};