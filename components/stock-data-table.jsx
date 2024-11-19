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
import { toast } from "sonner";
import DataTableControls from "./ui/data-table-controls";
import Loading from "./ui/loading";

const searchParameters = [
    { value: 'productName', label: 'Product Name' },
    { value: 'manufactureCompany', label: 'Manufacture Company' },
    { value: 'size', label: 'Size' },
    { value: 'sellingPrice', label: 'Selling Price' },
    { value: 'dealerName', label: 'Dealer Name' },
    { value: 'buyingPrize', label: 'Buying Prize' },
    { value: 'quantity', label: 'Quantity' },
    { value: 'billNumber', label: 'Bill Number' },
    { value: 'lotNumber', label: 'Lot Number' },
    { value: 'receivedDate', label: 'Received Date' },
    { value: 'createdAt', label: 'Entry Date' }
];

const columnList = [
    { value: 'product', label: 'Product' },
    { value: 'dealerName', label: 'Dealer Name' },
    { value: 'buyingPrize', label: 'Buying Prize' },
    { value: 'quantity', label: 'Quantity' },
    { value: 'billNumber', label: 'Bill Number' },
    { value: 'lotNumber', label: 'Lot Number' },
    { value: 'receivedDate', label: 'Received Date' },
    { value: 'createdAt', label: 'Entry Date' }
];

const formatDate = (type, dateString) => {
    if (!dateString || !type) return "";
    const d = new Date(dateString);
    return type === "date"
        ? `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
        : type === "time"
            ? `${d.getHours() > 12 ? d.getHours() - 12 : d.getHours()}:${d.getMinutes().toString().padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`
            : "";
};

const StockDetailsDrawer = ({ stock, product }) => {
    return (
        <DrawerContent className="p-2">
            <DrawerHeader className="max-w-2xl w-full flex justify-between items-center lg:px-0 pb-4 mx-auto mt-2">
                <DrawerTitle>Stock Details</DrawerTitle>
                <div className="flex gap-2">
                    <a href={`/admin/stocks/edit?id=${stock.id}`}>
                        <Button variant="outline" size="sm">
                            <SquarePen size={16} />
                            Edit
                        </Button>
                    </a>
                    <DeleteDialog
                        title="Stock"
                        onDelete={() => {
                            e.preventDefault();
                            handleDelete(stock.id);
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
                                <td className="py-3 text-sm">
                                    {
                                        product ? (
                                            <div>
                                                <p>{product.productName}</p>
                                                <small className="text-stone-500">
                                                    {product.manufactureCompany} | {product.size} | ₹ {product.sellingPrice}
                                                </small>
                                            </div>
                                        ) : ("Product not found")
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Dealer Name</td>
                                <td className="py-3 text-sm">{stock.dealerName}</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Buying Prize</td>
                                <td className="py-3 text-sm">₹ {stock.buyingPrize}</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Quantity</td>
                                <td className="py-3 text-sm">{stock.quantity}</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Bill Number</td>
                                <td className="py-3 text-sm">{stock.billNumber}</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Lot Number</td>
                                <td className="py-3 text-sm">{stock.lotNumber}</td>
                            </tr>
                            <tr>
                                <td className="py-3 text-sm font-medium text-gray-500">Received Date</td>
                                <td className="py-3 text-sm">{formatDate("date", stock.receivedDate)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="py-3 text-sm border-t text-gray-500">
                        Created on {formatDate("date", stock.createdAt)} at {formatDate("time", stock.createdAt)}
                        <br />
                        {stock.updatedAt && (
                            <>
                                Updated on {formatDate("date", stock.updatedAt)} at {formatDate("time", stock.updatedAt)}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DrawerContent>
    );
};

export default function StockDataTable() {
    const [data, setData] = useState([]);
    const [productData, setProductData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchParameter, setSearchParameter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [visibleColumns, setVisibleColumns] = useState({
        product: true,
        dealerName: true,
        buyingPrize: true,
        quantity: true,
        billNumber: true,
        lotNumber: true,
        receivedDate: true,
        createdAt: true
    });

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/products');

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const products = await response.json();
            setProductData(products);
        } catch (error) {
            toast.error("Failed to load products");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStocks = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/stocks');

            if (!response.ok) {
                throw new Error('Failed to fetch stocks');
            }

            const stocks = await response.json();
            setData(stocks);
        } catch (error) {
            toast.error("Failed to load stocks");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/stocks?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete stock');
            }

            await fetchStocks();
            toast.success("Stock deleted successfully");
        } catch (error) {
            toast.error("Failed to delete stock");
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchStocks();
    }, []);

    const getProductDetails = (productId) => {
        return productData.find(product => product.id === productId) || null;
    };

    const matchesSearchCriteria = (item, searchTerm, searchParameter) => {
        const term = searchTerm.toLowerCase();

        // Get associated product details
        const product = productData.find(p => p.id === item.productId);

        if (searchParameter === "all") {
            // If no product found, just search in stock fields
            if (!product) {
                return Object.keys(item).some((key) =>
                    key !== "id" &&
                    (key === "createdAt"
                        ? formatDate("date", item[key]).toLowerCase().includes(term)
                        : item[key].toString().toLowerCase().includes(term))
                );
            }

            // Search in all fields including product details
            return (
                // Search in stock fields
                Object.keys(item).some((key) =>
                    key !== "id" &&
                    (key === "createdAt"
                        ? formatDate("date", item[key]).toLowerCase().includes(term)
                        : item[key].toString().toLowerCase().includes(term))
                ) ||
                // Search in product fields
                product.productName?.toLowerCase().includes(term) ||
                product.manufactureCompany?.toLowerCase().includes(term) ||
                product.size?.toString().toLowerCase().includes(term) ||
                product.sellingPrice?.toString().toLowerCase().includes(term)
            );
        } else if (searchParameter === "createdAt") {
            return formatDate("date", item[searchParameter]).toLowerCase().includes(term);
        } else if (searchParameter === "productName" && product) {
            return product.productName.toLowerCase().includes(term);
        } else if (searchParameter === "manufactureCompany" && product) {
            return product.manufactureCompany.toLowerCase().includes(term);
        } else if (searchParameter === "size" && product) {
            return product.size.toString().toLowerCase().includes(term);
        } else if (searchParameter === "sellingPrice" && product) {
            return product.sellingPrice.toString().toLowerCase().includes(term);
        } else {
            // Search in stock fields for stock-specific parameters
            return item[searchParameter]?.toString().toLowerCase().includes(term);
        }
    };

    const filteredData = data.filter(item => matchesSearchCriteria(item, searchTerm, searchParameter));

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
                filename="stocks"
            />

            <div className="rounded-lg border">
                <Table>
                    {currentItems.length != 0 ? (
                        <TableHeader>
                            <TableRow className="bg-muted hover:bg-muted">
                                <TableHead>Product</TableHead>
                                {visibleColumns.dealerName && (
                                    <TableHead>Dealer Name</TableHead>
                                )}
                                {visibleColumns.buyingPrize && (
                                    <TableHead>Buying Prize</TableHead>
                                )}
                                {visibleColumns.quantity && <TableHead>Quantity</TableHead>}
                                {visibleColumns.billNumber && <TableHead>Bill Number</TableHead>}
                                {visibleColumns.lotNumber && <TableHead>Lot Number</TableHead>}
                                {visibleColumns.receivedDate && (
                                    <TableHead>Received Date</TableHead>
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
                                    No stocks found
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentItems.map((item) => (
                                <TableRow key={item.id}>
                                    <Drawer>
                                        <DrawerTrigger className="cursor-zoom-in" asChild>
                                            <TableCell>
                                                {(() => {
                                                    const product = getProductDetails(item.productId);
                                                    return product ? (
                                                        <div className="py-2">
                                                            <p>{product.productName}</p>
                                                            <small className="text-stone-500">
                                                                {product.manufactureCompany} | {product.size} | ₹ {product.sellingPrice}
                                                            </small>
                                                        </div>
                                                    ) : ("Product not found")
                                                })()}
                                            </TableCell>
                                        </DrawerTrigger>
                                        <StockDetailsDrawer stock={item} product={getProductDetails(item.productId)} onDelete={handleDelete} />
                                    </Drawer>
                                    {visibleColumns.dealerName && (
                                        <TableCell>{item.dealerName}</TableCell>
                                    )}
                                    {visibleColumns.buyingPrize && (
                                        <TableCell>₹ {item.buyingPrize}</TableCell>
                                    )}
                                    {visibleColumns.quantity && <TableCell>{item.quantity}</TableCell>}
                                    {visibleColumns.billNumber && <TableCell>{item.billNumber}</TableCell>}
                                    {visibleColumns.lotNumber && <TableCell>{item.lotNumber}</TableCell>}
                                    {visibleColumns.receivedDate && (
                                        <TableCell>{formatDate("date", item.receivedDate)}</TableCell>
                                    )}
                                    {visibleColumns.createdAt && (
                                        <TableCell>
                                            {formatDate("date", item.createdAt)}
                                        </TableCell>
                                    )}
                                    <TableCell className="sticky right-0 bg-background">
                                        <div className="flex gap-1">
                                            <a href={`/admin/stocks/edit?id=${item.id}`}>
                                                <Button size="icon" variant="ghost">
                                                    <SquarePen />
                                                </Button>
                                            </a>
                                            <DeleteDialog
                                                title="Stock"
                                                onDelete={() => {
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