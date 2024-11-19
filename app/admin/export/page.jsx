'use client'

import { useEffect, useState } from 'react'
import { Database, Users, ShoppingCart, Stack } from "@phosphor-icons/react";
import Loading from '@/components/ui/loading';
import { toast } from 'sonner'
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function Page() {
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [stocks, setStocks] = useState([])
  const dateTime = new Date().toISOString();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const [customerResponse, productResponse, stockResponse] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/products'),
          fetch('/api/stocks')
        ]);

        const customerData = await customerResponse.json();
        const productData = await productResponse.json();
        const stockData = await stockResponse.json();

        setCustomers(customerData)
        setProducts(productData)
        setStocks(stockData)
      } catch (error) {
        toast.error('Failed to fetch data')
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const buttons = [
    {
      label: 'All Data',
      icon: Database,
      onClick: () => exportAllData()
    },
    {
      label: 'Customers',
      icon: Users,
      onClick: () => exportCustomers()
    },
    {
      label: 'Products',
      icon: ShoppingCart,
      onClick: () => exportProducts()
    },
    {
      label: 'Stocks',
      icon: Stack,
      onClick: () => exportStocks()
    }
  ]

  const createCsvContent = (data) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(item => headers.map(header => item[header]).join(','))
    ];
    return csvRows.join('\n');
  }

  const downloadBlob = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const exportAllData = () => {
    const zip = new JSZip();
    
    zip.file(`customers-${dateTime}.csv`, createCsvContent(customers));
    zip.file(`products-${dateTime}.csv`, createCsvContent(products));
    zip.file(`stocks-${dateTime}.csv`, createCsvContent(stocks));

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, `inventory-${dateTime}.zip`);
    });
    toast.success('All data exported')
  }

  const exportCustomers = () => {
    const csv = createCsvContent(customers);
    downloadBlob(csv, `customers-${dateTime}.csv`);
    toast.success('Customers exported')
  }

  const exportProducts = () => {
    const csv = createCsvContent(products);
    downloadBlob(csv, `products-${dateTime}.csv`);
    toast.success('Products exported')
  }

  const exportStocks = () => {
    const csv = createCsvContent(stocks);
    downloadBlob(csv, `stocks-${dateTime}.csv`);
    toast.success('Stocks exported')
  }

  if (loading) {
    return (
      <Loading type="color" />
    )
  }

  return (
    <div className='w-full max-w-4xl mx-auto'>
      <h1 className='text-2xl md:text-4xl font-bold'>Export Data</h1>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 my-10'>
        {buttons.map((button) => (
          <button
            key={button.label}
            className='w-full flex items-center text-sm lg:text-base border border-input rounded-lg bg-background hover:bg-accent hover:text-accent-foreground px-5 py-4 gap-4'
            onClick={button.onClick}
          >
            <button.icon size={24} weight="light" />
            {button.label}
          </button>
        ))}
      </div>
    </div>
  )
}