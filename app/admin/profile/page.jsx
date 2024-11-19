import StoreProfileForm from '@/components/store-profile-form'
import React from 'react'

function page() {
  return (
    <div className='w-full max-w-5xl mx-auto'>
      <h1 className='text-2xl md:text-4xl font-bold'>Profile</h1>
      <p className="my-4 opacity-50">
        Configure your store information and.
      </p>
      <StoreProfileForm />
    </div>
  )
}

export default page