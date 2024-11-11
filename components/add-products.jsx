// add-product.jsx
'use client';

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import ProductForm from "./ui/product-form";
import Loading from "./ui/loading";

export default function AddProducts() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (data) => {
        try {
            setIsSubmitting(true);

            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to add product');
            }

            toast.success('Product has been added successfully.');
            router.push('/products');
        } catch (error) {
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="py-12">
            <ProductForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitButtonText={isSubmitting ? (
                    <div className="flex items-center space-x-2">
                        <Loading />
                        <span>Adding...</span>
                    </div>
                ) : "Add New"}
            />
        </div>
    );
}