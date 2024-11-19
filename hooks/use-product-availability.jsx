'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function useProductAvailability(setIsLoading) {
  const [stockData, setStockData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [availableStock, setAvailableStock] = useState({});

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch stock data
      const stockResponse = await fetch('/api/stocks');
      if (!stockResponse.ok) throw new Error('Failed to fetch stocks');
      const stocks = await stockResponse.json();
      setStockData(stocks);

      // Fetch customer data
      const customerResponse = await fetch('/api/customers');
      if (!customerResponse.ok) throw new Error('Failed to fetch customers');
      const customers = await customerResponse.json();
      setCustomerData(customers);

      // Fetch products data
      const productsResponse = await fetch('/api/products');
      if (!productsResponse.ok) throw new Error('Failed to fetch products');
      const products = await productsResponse.json();
      setProductsData(products);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (stockData.length > 0 && productsData.length > 0) {
      const availableStockData = {};

      // Process each product
      productsData.forEach((product) => {
        // Calculate total stock for the product
        const productStocks = stockData.filter(
          (stock) => stock.productId === product.id
        );
        const totalStock = productStocks.reduce(
          (total, stock) => total + (parseInt(stock.quantity) || 0),
          0
        );

        // Calculate total customer purchases for the product
        const totalPurchased = customerData.reduce((total, customer) => {
          const customerPurchase = customer.products?.find(
            (p) => p.productId === product.id
          );
          return total + (parseInt(customerPurchase?.quantity) || 0);
        }, 0);

        // Calculate available stock
        availableStockData[product.id] = Math.max(0, totalStock - totalPurchased);
      });

      setAvailableStock(availableStockData);
    }
  }, [stockData, customerData, productsData]);

  return availableStock;
}