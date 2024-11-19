import CustomerDataTable from '@/components/customer-data-table'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import React from 'react'

function page() {
  return (
    <div className='w-full max-w-6xl mx-auto'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl md:text-4xl font-bold'>Customers</h1>
        <a href='customers/add'>
          <Button size='sm' >
            <UserPlus />
              Make Bill
          </Button>
        </a>
      </div>
      <CustomerDataTable />
    </div>
  )
}

export default page