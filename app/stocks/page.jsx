import StockDataTable from '@/components/stock-data-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React from 'react'

function page() {
  return (
    <div className='w-full max-w-6xl mx-auto'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl md:text-4xl font-bold'>Stocks</h1>
        <a href='/stocks/add'>
          <Button size='sm' >
            <Plus />
            Add Stock
          </Button>
        </a>
      </div>
      <StockDataTable />
    </div>
  )
}

export default page