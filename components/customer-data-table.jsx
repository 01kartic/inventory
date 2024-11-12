"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "./ui/drawer";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import { Separator } from "./ui/separator";
import DataTableControls from "./ui/data-table-controls";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Loading from "./ui/loading";

const searchParameters = [
    { value: 'billNumber', label: 'Bill Number' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'address', label: 'Address' },
    { value: 'mobileNumber', label: 'Mobile Number' },
    { value: 'productName', label: 'Product Name' },
    { value: 'manufactureCompany', label: 'Manufacturer' },
    { value: 'size', label: 'Size' },
    { value: 'sellingPrice', label: 'Selling Price' },
    { value: 'paymentMode', label: 'Payment Mode' },
    { value: 'createdAt', label: 'Entry Date' }
];

const columnList = [
    { value: 'billNumber', label: 'Bill Number' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'mobileNumber', label: 'Mobile Number' },
    { value: 'products', label: 'Products' },
    { value: 'buyingQuantity', label: 'Buying Quantity' },
    { value: 'paymentMode', label: 'Payment Mode' },
    { value: 'createdAt', label: 'Entry Date' }
];

const formatDate = (type, dateString) => {
    if (!dateString || !type) return "";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ""; // Check for invalid date

        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };

        return type === "date"
            ? date.toLocaleDateString('en-US', dateOptions)
            : type === "time"
                ? date.toLocaleTimeString('en-US', timeOptions)
                : "";
    } catch (error) {
        console.error('Error formatting date:', error);
        return "";
    }
};

const ProductTooltip = ({ product }) => {
    if (!product) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger className="text-left">
                    {product.productName || 'Product not found'}
                </TooltipTrigger>
                <TooltipContent className="flex items-center gap-2">
                    {product.manufactureCompany}
                    <Separator orientation="vertical" className="h-4" />
                    {product.size}
                    <Separator orientation="vertical" className="h-4" />
                    ₹{product.sellingPrice}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const CustomerDetailsDrawer = ({ customer, products }) => {
    return (
        <DrawerContent className="p-2">
            <DrawerHeader className="max-w-2xl w-full flex justify-between items-center lg:px-0 pb-4 mx-auto mt-2">
                <DrawerTitle>Customer Details</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
                <div className="max-w-2xl mx-auto">
                    <table className="w-full">
                        <tbody className="divide-y">
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Bill Number</td>
                                <td className="py-3 text-sm">{customer?.billNumber}</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Customer Name</td>
                                <td className="py-3 text-sm">{customer?.customerName}</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Address</td>
                                <td className="py-3 text-sm">{customer?.address}</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Mobile Number</td>
                                <td className="py-3 text-sm">{customer?.mobileNumber}</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Products</td>
                                <td className="py-3 text-sm">
                                    {Array.isArray(products) && products.length > 0 ? (
                                        products.map((product, index) => (
                                            <div key={`${product.productId}-${index}`} className="py-1">
                                                <ProductTooltip product={product} />
                                                <Badge variant='ghost' className="ml-2">
                                                    {product.quantity}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div>None</div>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Total Amount</td>
                                <td className="py-3 text-sm">
                                    ₹ {products.reduce((total, p) => total + (p.quantity * p.sellingPrice), 0)}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Payment Mode</td>
                                <td className="py-3 text-sm">{customer?.paymentMode}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="py-3 text-sm border-t text-gray-500">
                        Created on {formatDate("date", customer?.createdAt)} at {formatDate("time", customer?.createdAt)}
                        {customer?.updatedAt && (
                            <>
                                <br />
                                Updated on {formatDate("date", customer.updatedAt)} at {formatDate("time", customer.updatedAt)}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DrawerContent>
    );
};

export default function CustomerDataTable() {
    const [data, setData] = useState([]);
    const [productData, setProductData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchParameter, setSearchParameter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [visibleColumns, setVisibleColumns] = useState({
        billNumber: true,
        customerName: true,
        mobileNumber: true,
        productId: true,
        buyingQuantity: true,
        paymentMode: true,
        createdAt: true
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [productsResponse, customersResponse] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/customers')
            ]);

            if (!productsResponse.ok || !customersResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const [products, customers] = await Promise.all([
                productsResponse.json(),
                customersResponse.json()
            ]);

            setProductData(products);
            setData(customers);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getProduct = (productId) => {
        return productData.find(p => p.id === productId);
    };

    const matchesSearchCriteria = (item, term, parameter) => {
        if (!item) return false;

        const searchTerm = term.toLowerCase();
        const products = Array.isArray(item.products) ? item.products : [];

        if (parameter === "all") {
            return (
                item.billNumber?.toLowerCase().includes(searchTerm) ||
                item.customerName?.toLowerCase().includes(searchTerm) ||
                item.address?.toLowerCase().includes(searchTerm) ||
                item.mobileNumber?.toLowerCase().includes(searchTerm) ||
                item.paymentMode?.toLowerCase().includes(searchTerm) ||
                formatDate("date", item.createdAt)?.toLowerCase().includes(searchTerm) ||
                products.some(p => {
                    const product = getProduct(p.productId);
                    return product?.productName?.toLowerCase().includes(searchTerm) ||
                        product?.manufactureCompany?.toLowerCase().includes(searchTerm) ||
                        product?.size?.toString().toLowerCase().includes(searchTerm) ||
                        product?.sellingPrice?.toString().includes(searchTerm);
                })
            );
        }

        // Handle specific field searches
        if (parameter === "createdAt") {
            return formatDate("date", item[parameter])?.toLowerCase().includes(searchTerm);
        }

        if (["productName", "manufactureCompany", "size", "sellingPrice"].includes(parameter)) {
            return products.some(p => {
                const product = getProduct(p.productId);
                return product?.[parameter]?.toString().toLowerCase().includes(searchTerm);
            });
        }

        return item[parameter]?.toString().toLowerCase().includes(searchTerm);
    };

    const filteredData = data.filter(item => matchesSearchCriteria(item, searchTerm, searchParameter));
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const renderPaginationButtons = () => {
        const maxVisiblePages = 5;
        const buttons = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i)}
                    className="w-9"
                >
                    {i}
                </Button>
            );
        }
        return buttons;
    };

    if (isLoading) {
        return <Loading type="color" />;
    }

    return (
        <div className="mt-6">
            <DataTableControls
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchParameter={searchParameter}
                onSearchParameterChange={setSearchParameter}
                searchParameters={searchParameters}
                visibleColumns={visibleColumns}
                onColumnChange={setVisibleColumns}
                columnList={columnList}
                data={filteredData}
                filename="customers"
            />

            <div className="rounded-lg border">
                <Table>
                    {currentItems.length > 0 && (
                        <TableHeader>
                            <TableRow className="bg-muted hover:bg-muted">
                                <TableHead>Bill Number</TableHead>
                                {visibleColumns.customerName && (
                                    <TableHead className="sticky left-0 bg-muted">Customer Name</TableHead>
                                )}
                                {visibleColumns.mobileNumber && (
                                    <TableHead>Mobile Number</TableHead>
                                )}
                                {visibleColumns.productId && (
                                    <TableHead>Product</TableHead>
                                )}
                                {visibleColumns.buyingQuantity && (
                                    <TableHead>Quantity</TableHead>
                                )}
                                {visibleColumns.paymentMode && (
                                    <TableHead>Payment Mode</TableHead>
                                )}
                                {visibleColumns.createdAt && (
                                    <TableHead>Entry Date</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                    )}
                    <TableBody>
                        {currentItems.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={Object.values(visibleColumns).filter(Boolean).length + 1}
                                    className="text-center h-16 hover:bg-background"
                                >
                                    No customers found
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentItems.map((item) => (
                                <TableRow key={item.id}>
                                    <Drawer>
                                        <DrawerTrigger className="cursor-zoom-in" asChild>
                                            <TableCell>{item.billNumber}</TableCell>
                                        </DrawerTrigger>
                                        <CustomerDetailsDrawer
                                            customer={item}
                                            products={item.products?.map(p => ({
                                                ...p,
                                                ...getProduct(p.productId)
                                            }))}
                                        />
                                    </Drawer>
                                    {visibleColumns.customerName && (
                                        <TableCell className="sticky left-0 bg-background">
                                            {item.customerName}
                                            {item.address && (
                                                <>
                                                    <br />
                                                    <small className="text-stone-500">
                                                        {item.address}
                                                    </small>
                                                </>
                                            )}
                                        </TableCell>
                                    )}
                                    {visibleColumns.mobileNumber && (
                                        <TableCell>{item.mobileNumber}</TableCell>
                                    )}
                                    {visibleColumns.productId && (
                                        <TableCell>
                                            {Array.isArray(item.products) && item.products.length > 0 ? (
                                                item.products.map((product, index) => (
                                                    <div key={`${product.productId}-${index}`} className="py-1">
                                                        <ProductTooltip product={getProduct(product.productId)} />
                                                    </div>
                                                ))
                                            ) : (
                                                <div>None</div>
                                            )}
                                        </TableCell>
                                    )}
                                    {visibleColumns.buyingQuantity && (
                                        <TableCell>
                                            {Array.isArray(item.products) && item.products.length > 0 ? (
                                                item.products.map((product, index) => (
                                                    <div className="py-1">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger key={product.productId || index}>
                                                                    {product.quantity}
                                                                </TooltipTrigger>
                                                                <br />
                                                                <TooltipContent className="flex items-center gap-2">
                                                                    {productData.find(p => p.id === product.productId)?.productName || 'Product not found'}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                ))
                                            ) : (
                                                <div>None</div>
                                            )}
                                        </TableCell>
                                    )}
                                    {visibleColumns.paymentMode && (
                                        <TableCell>
                                            {item.paymentMode === "CASH" ? (
                                                <Badge variant="ghost">CASH</Badge>
                                            ) : (
                                                <Badge>ONLINE</Badge>
                                            )}
                                        </TableCell>
                                    )}
                                    {visibleColumns.createdAt && (
                                        <TableCell>
                                            {formatDate("date", item.createdAt)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-between items-center mt-4">
                {currentItems.length != 0 ? (
                    <>
                        <div className="text-sm text-gray-500">
                            Showing {indexOfFirstItem + 1} to{" "}
                            {Math.min(indexOfLastItem, filteredData.length)} of{" "}
                            {filteredData.length} entries
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <div className="flex gap-1">
                                {renderPaginationButtons()}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </>
                ) : ("")}
            </div>
        </div>
    );
}