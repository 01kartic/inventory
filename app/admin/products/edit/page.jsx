import EditProduct from '@/components/edit-products'
import Loading from '@/components/ui/loading'
import { Suspense } from 'react'
import React from 'react'

function page() {
  return (
    <div className='w-full max-w-5xl mx-auto'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl md:text-4xl font-bold'>Edit Products</h1>
      </div>

      <Suspense fallback={<Loading />}>
        <EditProduct />
      </Suspense>
    </div>
  )
}

export default page