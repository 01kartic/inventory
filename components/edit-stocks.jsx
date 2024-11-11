'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import StockForm from "./ui/stock-form";
import Loading from "./ui/loading";

export default function EditStocks() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stockData, setStockData] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const stockId = searchParams.get('id');

    useEffect(() => {
        async function fetchStockData() {
            if (!stockId) {
                router.push('/stocks');
                return;
            }

            try {
                setIsLoading(true);
                const response = await fetch(`/api/stocks?id=${stockId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch stock');
                }

                setStockData({
                    productId: data.productId,
                    dealerName: data.dealerName,
                    buyingPrize: data.buyingPrize,
                    quantity: data.quantity,
                    billNumber: data.billNumber,
                    lotNumber: data.lotNumber,
                    receivedDate: new Date(data.receivedDate).toISOString().split('T')[0]
                });
            } catch (error) {
                console.error('Error fetching stock:', error);
                toast.error("Failed to load stock data");
                router.push('/stocks');
            } finally {
                setIsLoading(false);
            }
        }

        fetchStockData();
    }, [stockId, router]);

    async function onSubmit(data) {
        try {
            setIsSubmitting(true);

            const formattedData = {
                ...data,
                buyingPrize: Number(data.buyingPrize),
                quantity: Number(data.quantity),
                receivedDate: new Date(data.receivedDate).toISOString(),
            };

            const response = await fetch(`/api/stocks?id=${stockId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update stock');
            }

            toast.success('Stock has been updated successfully.');
            router.push('/stocks');
            router.refresh();
        } catch (error) {
            console.error('Error updating stock:', error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <Loading type="color" />
        );
    }

    return (
        <div className="py-12">
            {stockData && (
                <StockForm
                    initialData={stockData}
                    onSubmit={onSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => router.push('/stocks')}
                />
            )}
        </div>
    );
}