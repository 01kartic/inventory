import AddStocks from '@/components/add-stocks'
import React from 'react'

function page() {
  return (
    <div className='w-full max-w-5xl mx-auto'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl md:text-4xl font-bold'>Add Stocks</h1>
      </div>
      <AddStocks />
    </div>
  )
}

export default page