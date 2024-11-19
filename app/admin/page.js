"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("admin/dashboard")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="m-10 md:m-24">
        <p className="md:text-xl">Welcome back, <span className="font-bold">Chief</span> to</p>
        <p className="text-6xl md:text-8xl font-bold">Inventory</p>
    </div>
  )
}