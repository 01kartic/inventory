import CustomerForm from "@/components/ui/customer-form";
import React from 'react'

export default function page() {
  return (
    <div className='w-full max-w-5xl mx-auto'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl md:text-4xl font-bold'>Add Customers</h1>
      </div>
      <div className="pt-4 pb-16">
            <CustomerForm />
        </div>
    </div>
  )
}