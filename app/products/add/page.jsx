import AddProducts from '@/components/add-products'
import React from 'react'

function page() {
  return (
    <div className='w-full max-w-5xl mx-auto'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl md:text-4xl font-bold'>Add Products</h1>
      </div>
      <AddProducts />
    </div>
  )
}

export default page