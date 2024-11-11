// edit-product.jsx
'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import ProductForm from "./ui/product-form";
import Loading from "./ui/loading";

export default function EditProduct() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [productData, setProductData] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');

    useEffect(() => {
        async function fetchProductData() {
            if (!productId) {
                router.push('/products');
                return;
            }

            try {
                setIsLoading(true);
                const response = await fetch(`/api/products?id=${productId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch product');
                }

                setProductData(data);
            } catch (error) {
                console.error('Error fetching product:', error);
                toast.error("Failed to load product data");
                router.push('/products');
            } finally {
                setIsLoading(false);
            }
        }

        fetchProductData();
    }, [productId, router]);

    const handleSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            const response = await fetch(`/api/products?id=${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update product');
            }

            toast.success('Product has been updated successfully.');
            router.push('/products');
            router.refresh();
        } catch (error) {
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <Loading type="color" />;
    }

    if (!productData) {
        return null;
    }

    return (
        <div className="py-12">
            <ProductForm
                initialData={productData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitButtonText={isSubmitting ? (
                    <div className="flex items-center space-x-2">
                        <Loading />
                        <span>Updating...</span>
                    </div>
                ) : "Save Changes"}
            />
        </div>
    );
}