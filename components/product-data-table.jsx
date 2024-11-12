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
import DeleteDialog from "./ui/delete-dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "./ui/drawer";
import { SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import DataTableControls from "./ui/data-table-controls";
import Loading from "./ui/loading";
import { Badge } from "./ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip"
import useProductAvailability from "@/hooks/use-product-availability";

const searchParameters = [
    { value: 'productName', label: 'Product Name' },
    { value: 'manufactureCompany', label: 'Manufacture Company' },
    { value: 'size', label: 'Size' },
    { value: 'sellingPrice', label: 'Selling Price' },
    { value: 'createdAt', label: 'Entry Date' }
];

const columnList = [
    { value: 'manufactureCompany', label: 'Manufacture Company' },
    { value: 'size', label: 'Size' },
    { value: 'availibility', label: 'Availibility' },
    { value: 'sellingPrice', label: 'Selling Price' },
    { value: 'createdAt', label: 'Entry Date' }
];

const formatDate = (type, dateString) => {
    if (!dateString || !type) return "";

    try {
        const date = new Date(dateString);
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        if (type === "date") {
            return date.toLocaleDateString('en-US', dateOptions);
        }
        if (type === "time") {
            return date.toLocaleTimeString('en-US', timeOptions);
        }
        return "";
    } catch (error) {
        return "";
    }
};

const ProductDetailsDrawer = ({ product, availableStock }) => {
    return (
        <DrawerContent className="p-2">
            <DrawerHeader className="max-w-2xl w-full flex justify-between items-center lg:px-0 pb-4 mx-auto mt-2">
                <DrawerTitle>Product Details</DrawerTitle>
                <div className="flex gap-2">
                    <Link href={`/products/edit?id=${product.id}`}>
                        <Button variant="outline" size="sm">
                            <SquarePen size={16} />
                            Edit
                        </Button>
                    </Link>
                    <DeleteDialog
                        title="Product"
                        onDelete={() => {
                            e.preventDefault();
                            handleDelete(product.id);
                        }}
                    >
                        <Button variant="destructiveOutline" size="sm" >
                            <Trash2 size={16} />
                            Delete
                        </Button>
                    </DeleteDialog>
                </div>
            </DrawerHeader>
            <div className="p-4">
                <div className="max-w-2xl mx-auto">
                    <table className="w-full">
                        <tbody className="divide-y">
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Product Name</td>
                                <td className="py-3 text-sm">{product.productName}</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Manufacture Company</td>
                                <td className="py-3 text-sm">{product.manufactureCompany}</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Size</td>
                                <td className="py-3 text-sm">{product.size}</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Availibility</td>
                                <td className="py-3 text-sm">
                                    {availableStock[product.id] > 0 ? (
                                        <Badge className="mr-2">{availableStock[product.id]}</Badge>
                                    ) : ("")}
                                    {availableStock[product.id] > 0 ? (
                                        <Badge variant="success">Available</Badge>
                                    ) : (
                                        <Badge variant="destructive">Out of Stock</Badge>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Selling Price</td>
                                <td className="py-3 text-sm">₹ {product.sellingPrice}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="py-3 text-sm border-t text-gray-500">
                        Created on {formatDate("date", product.createdAt)} at {formatDate("time", product.createdAt)}
                        <br />
                        {product.updatedAt && (
                            <>
                                Updated on {formatDate("date", product.updatedAt)} at {formatDate("time", product.updatedAt)}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DrawerContent>
    );
};

export default function ProductDataTable() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchParameter, setSearchParameter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [visibleColumns, setVisibleColumns] = useState({
        manufactureCompany: true,
        size: true,
        availibility: true,
        sellingPrice: true,
        createdAt: true,
    });

    const availableStock = useProductAvailability(setIsLoading)
    console.log("stock :", availableStock)

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/products');

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const products = await response.json();
            setData(products);
        } catch (error) {
            toast.error("Failed to load products");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/products?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            await fetchProducts();
            toast.success("Product deleted successfully");
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredData = data.filter((item) => {
        if (searchParameter === "all") {
            return Object.keys(item).some((key) =>
                key !== "id" &&
                (key === "createdAt"
                    ? formatDate("date", item[key]).toLowerCase().includes(searchTerm.toLowerCase())
                    : item[key].toString().toLowerCase().includes(searchTerm.toLowerCase()))
            );
        } else if (searchParameter === "createdAt") {
            return formatDate("date", item[searchParameter]).toLowerCase().includes(searchTerm.toLowerCase());
        } else {
            return item[searchParameter]
                .toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        }
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const renderPaginationButtons = () => {
        const buttons = [];
        for (let i = 1; i <= totalPages; i++) {
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
        return (
            <Loading type="color" />
        );
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
                filename="products"
            />

            <div className="rounded-lg border">
                <Table>
                    {currentItems.length != 0 ? (
                        <TableHeader>
                            <TableRow className="bg-muted hover:bg-muted">
                                <TableHead>Product Name</TableHead>
                                {visibleColumns.manufactureCompany && (
                                    <TableHead>Manufacture Company</TableHead>
                                )}
                                {visibleColumns.size && <TableHead>Size</TableHead>}
                                {visibleColumns.availibility && <TableHead>Availibility</TableHead>}
                                {visibleColumns.sellingPrice && (
                                    <TableHead>Selling Price</TableHead>
                                )}
                                {visibleColumns.createdAt && (
                                    <TableHead>Entry Date</TableHead>
                                )}
                                <TableHead className="w-24 text-center sticky right-0 bg-muted">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                    ) : ("")}
                    <TableBody>
                        {currentItems.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={
                                        Object.values(visibleColumns).filter(Boolean).length + 1
                                    }
                                    className="text-center h-16 hover:bg-background"
                                >
                                    No products found
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentItems.map((item) => (
                                <TableRow key={item.id}>
                                    <Drawer>
                                        <DrawerTrigger className="cursor-zoom-in" asChild>
                                            <TableCell>{item.productName}</TableCell>
                                        </DrawerTrigger>
                                        <ProductDetailsDrawer product={item} availableStock={availableStock} onDelete={handleDelete} />
                                    </Drawer>
                                    {visibleColumns.manufactureCompany && (
                                        <TableCell>{item.manufactureCompany}</TableCell>
                                    )}
                                    {visibleColumns.size && <TableCell>{item.size}</TableCell>}
                                    {visibleColumns.availibility && (
                                        <TableCell>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        {
                                                            availableStock[item.id] && availableStock[item.id] > 0 ? (
                                                                <Badge variant="success">Available</Badge>
                                                            ) : (
                                                                <Badge variant="destructive">Out of Stock</Badge>
                                                            )
                                                        }
                                                    </TooltipTrigger>
                                                    {availableStock[item.id] > 0 ? (
                                                        <TooltipContent>
                                                            {availableStock[item.id]}
                                                        </TooltipContent>
                                                    ) : ("")}
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    )}
                                    {visibleColumns.sellingPrice && (
                                        <TableCell>₹ {item.sellingPrice}</TableCell>
                                    )}
                                    {visibleColumns.createdAt && (
                                        <TableCell>
                                            {formatDate("date", item.createdAt)}
                                        </TableCell>
                                    )}
                                    <TableCell className="sticky right-0 bg-background">
                                        <div className="flex gap-1">
                                            <Link href={`/products/edit?id=${item.id}`}>
                                                <Button size="icon" variant="ghost">
                                                    <SquarePen />
                                                </Button>
                                            </Link>
                                            <DeleteDialog
                                                title="Product"
                                                onDelete={() => {
                                                    e.preventDefault();
                                                    handleDelete(item.id);
                                                }}
                                            />
                                        </div>
                                    </TableCell>
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