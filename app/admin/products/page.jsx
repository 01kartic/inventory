import ProductDataTable from '@/components/product-data-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React from 'react'

function page() {
  return (
    <div className='w-full max-w-6xl mx-auto'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl md:text-4xl font-bold'>Products</h1>
        <a href='products/add'>
          <Button size='sm' >
            <Plus />
            Add Product
          </Button>
        </a>
      </div>
      <ProductDataTable />
    </div>
  )
}

export default page