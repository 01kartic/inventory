'use client';

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Printer, Plus, TrashSimple, Check, CaretDown, Minus, CalendarBlank } from "@phosphor-icons/react";
import Loading from "./loading";
import useProductAvailability from "@/hooks/use-product-availability";

const API_ENDPOINT = '/api/customers';
const PRODUCT_API = '/api/products';

export default function CustomerForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [products, setProducts] = useState([]);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        defaultValues: {
            customerName: "",
            address: "",
            mobileNumber: "",
            products: [{ productId: "", quantity: "1" }],
            paymentMode: "cash",
        },
    });

    const availableStock = useProductAvailability(setIsLoading)

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "products",
    });

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(PRODUCT_API);
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                toast.error('Failed to load products');
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const getProductDisplay = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return "";
        return (
            <div className="text-start">
                <p>{product.productName}</p>
                <small className="text-stone-500">{product.manufactureCompany} | {product.size}</small>
            </div>
        );
    };

    const getProductPrice = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.sellingPrice : "0";
    };

    const watchProducts = form.watch("products") || [];

    const totalAmount = watchProducts.reduce((total, product) => {
        const quantity = parseFloat(product.quantity) || 0;
        const price = parseFloat(getProductPrice(product.productId)) || 0;
        return total + (quantity * price);
    }, 0);

    const handleProductSelect = (value, index) => {
        form.setValue(`products.${index}.productId`, value);
    };

    const isComplete = () => watchProducts.every(p => p.productId);
    const canAdd = () => isComplete() && fields.length < products.length;

    const buttonText = () => {
        if (!isComplete()) return "Please select product first";
        if (fields.length >= products.length) return "No more products available";
        return "Add More Product";
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            const submissionData = {
                ...data,
                products: data.products.map(product => ({
                    productId: product.productId,
                    quantity: parseInt(product.quantity)
                })),
                paymentMode: data.paymentMode.toUpperCase()
            };

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || `HTTP error! status: ${response.status}`);
            }

            await response.json();
            router.push('/customers');
            toast.success('Customer added successfully');
        } catch (error) {
            console.error('Error adding customer:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <Loading type="color" />;
    }

    return (
        <div className="flex flex-1 flex-col gap-4 py-4">
            <div className="mx-auto w-full max-w-5xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="customerName"
                                rules={{ required: "Customer Name is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter customer name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                rules={{ required: "Address is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="mobileNumber"
                                rules={{
                                    required: "Mobile Number is required",
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Please enter a valid 10-digit mobile number"
                                    }
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mobile Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                placeholder="Enter mobile number"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Products Table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hidden lg:table-row">
                                        <TableHead className="w-[40%]">Product</TableHead>
                                        <TableHead className="w-[20%]">Quantity</TableHead>
                                        <TableHead className="w-[20%]">Price</TableHead>
                                        <TableHead className="w-[15%] text-center">Total</TableHead>
                                        <TableHead className="w-[5%]"></TableHead>
                                    </TableRow>
                                    <TableRow className="block lg:hidden">
                                        <TableHead>Products</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id} className="block lg:table-row hover:bg-background">
                                            <TableCell className="block lg:table-cell w-full lg:w-[40%] py-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`products.${index}.productId`}
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
                                                                                {products.map((product) =>
                                                                                    parseInt(availableStock[product.id]) > 0 ? (
                                                                                        <CommandItem
                                                                                            key={product.id}
                                                                                            value={`${product.productName} ${product.manufactureCompany} ${product.size}`}
                                                                                            onSelect={() => {
                                                                                                handleProductSelect(product.id, index);
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
                                                                                    ) : null
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
                                            </TableCell>

                                            {/* Quantity - Desktop */}
                                            <TableCell className="hidden lg:table-cell lg:w-[20%] py-2">
                                                <div className="relative flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute h-6 w-6 top-1/2 -translate-y-1/2 left-2 rounded"
                                                        onClick={() => {
                                                            const currentValue = parseInt(form.getValues(`products.${index}.quantity`)) || 0;
                                                            if (currentValue > 1) {
                                                                form.setValue(`products.${index}.quantity`, (currentValue - 1).toString());
                                                            }
                                                        }}
                                                    >
                                                        <Minus size={16} />
                                                    </Button>
                                                    <FormField
                                                        control={form.control}
                                                        name={`products.${index}.quantity`}
                                                        render={({ field: quantityField }) => (
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                max={availableStock[watchProducts[index]?.productId]}
                                                                {...quantityField}
                                                                onChange={(e) => {
                                                                    quantityField.onChange(e);
                                                                }}
                                                                disabled={!canAdd()}
                                                                className="w-full text-center"
                                                            />
                                                        )}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute h-6 w-6 top-1/2 -translate-y-1/2 right-2 rounded"
                                                        onClick={() => {
                                                            const currentValue = parseInt(form.getValues(`products.${index}.quantity`)) || 0;
                                                            form.setValue(`products.${index}.quantity`, (currentValue + 1).toString());
                                                        }}
                                                    >
                                                        <Plus size={16} />
                                                    </Button>
                                                </div>
                                            </TableCell>

                                            {/* Price - Desktop */}
                                            <TableCell className="hidden lg:table-cell lg:w-[20%] py-2">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                                                    <Input
                                                        type="number"
                                                        value={getProductPrice(watchProducts[index]?.productId)}
                                                        readOnly
                                                        className="w-full pl-8 border-0 bg-muted focus-visible:ring-0"
                                                    />
                                                </div>
                                            </TableCell>

                                            {/* Quantity and Price - Mobile Only */}
                                            <TableCell className="block lg:hidden w-full py-2">
                                                <div className="flex justify-between items-center gap-2">
                                                    <div className="w-1/2">
                                                        <span className="block text-sm text-gray-500 mb-1">Quantity</span>
                                                        <div className="relative flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute h-6 w-6 top-1/2 -translate-y-1/2 left-2 rounded"
                                                                onClick={() => {
                                                                    const currentValue = parseInt(form.getValues(`products.${index}.quantity`)) || 0;
                                                                    if (currentValue > 1) {
                                                                        form.setValue(`products.${index}.quantity`, (currentValue - 1).toString());
                                                                    }
                                                                }}
                                                            >
                                                                <Minus size={16} />
                                                            </Button>
                                                            <FormField
                                                                control={form.control}
                                                                name={`products.${index}.quantity`}
                                                                render={({ field: quantityField }) => (
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        max={availableStock[watchProducts[index]?.productId]}
                                                                        {...quantityField}
                                                                        onChange={(e) => {
                                                                            quantityField.onChange(e);
                                                                            handleQuantityChange(e.target.value, index);
                                                                        }}
                                                                        disabled={!canAdd()}
                                                                        className="w-full text-center"
                                                                    />
                                                                )}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute h-6 w-6 top-1/2 -translate-y-1/2 right-2 rounded"
                                                                onClick={() => {
                                                                    const currentValue = parseInt(form.getValues(`products.${index}.quantity`)) || 0;
                                                                    form.setValue(`products.${index}.quantity`, (currentValue + 1).toString());
                                                                }}
                                                            >
                                                                <Plus size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="w-1/2">
                                                        <span className="block text-sm text-gray-500 mb-1">Price</span>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                                                            <Input
                                                                type="number"
                                                                value={getProductPrice(watchProducts[index]?.productId)}
                                                                readOnly
                                                                className="w-full pl-6 border-0 bg-muted focus-visible:ring-0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Total */}
                                            <TableCell className="block lg:table-cell w-full lg:w-[15%] py-2">
                                                <div className="flex justify-between items-center lg:justify-center">
                                                    <div className="w-full">
                                                        <span className="block lg:hidden text-sm text-gray-500 mb-1">Total</span>
                                                        <div className="w-full font-medium lg:text-end">
                                                            ₹ {(
                                                                parseFloat(watchProducts[index]?.quantity || 0) *
                                                                parseFloat(getProductPrice(watchProducts[index]?.productId))
                                                            ).toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <div className="block lg:hidden">
                                                        {fields.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => remove(index)}
                                                            >
                                                                <TrashSimple size={16} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Delete Button - Desktop */}
                                            <TableCell className="hidden lg:table-cell lg:w-[5%] py-2">
                                                {fields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <TrashSimple className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {/* Add Product and Total Row */}
                                    <TableRow className="block lg:table-row hover:bg-background">
                                        <TableCell colSpan={2} className="block lg:table-cell py-4">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => append({ productId: "", quantity: "1" })}
                                                className="lg:w-auto text-info hover:bg-info/25"
                                                disabled={!canAdd()}
                                            >
                                                <Plus size={16} />
                                                {buttonText()}
                                            </Button>
                                        </TableCell>
                                        <TableCell
                                            colSpan={1}
                                            className="block lg:table-cell lg:text-right font-medium py-4"
                                        >
                                            Total Amount :
                                        </TableCell>
                                        <TableCell
                                            className="block lg:table-cell font-semibold text-lg py-4 lg:text-end"
                                        >
                                            ₹ {totalAmount.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell"></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex flex-col md:flex-row md:justify-between items-end gap-3">
                            <div className="w-full md:w-1/3">
                                <FormField
                                    control={form.control}
                                    name="paymentMode"
                                    rules={{ required: "Payment Mode is required" }}
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Payment Method</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex gap-0"
                                                >
                                                    <FormItem>
                                                        <FormControl>
                                                            <RadioGroupItem className="hidden" value="cash" id="payment-cash" />
                                                        </FormControl>
                                                        <FormLabel htmlFor="payment-cash" className="cursor-pointer">
                                                            <span className={`inline-block px-4 py-3 rounded-s-lg rounded-e-0 border border-e-0 ${field.value === "cash" ? "bg-primary text-background" : "bg-background text-primary"} transition`}>
                                                                Cash
                                                            </span>
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem>
                                                        <FormControl>
                                                            <RadioGroupItem className="hidden" value="online" id="payment-online" />
                                                        </FormControl>
                                                        <FormLabel htmlFor="payment-online" className="cursor-pointer">
                                                            <span className={`inline-block px-4 py-3 rounded-s-0 rounded-e-lg border border-s-0 ${field.value === "online" ? "bg-primary text-background" : "bg-background text-primary"} transition`}>
                                                                Online
                                                            </span>
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/customers')}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loading />
                                            Billing...
                                        </>
                                    ) : (
                                        <>
                                            <Printer size={20} />
                                            Save Bill
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}