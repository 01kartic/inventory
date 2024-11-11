// app/api/store/route.js
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db("inventory")
        const store = await db.collection("store").findOne({})

        const defaultData = {
            storeName: "",
            logo: "",
            address: "",
            mobileNumbers: [{ name: "", number: "" }],
            terms: ""
        }

        return NextResponse.json(store || defaultData)
    } catch (error) {
        console.error('Database Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch store data' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    if (!request.body) {
        return NextResponse.json(
            { error: 'No data provided' },
            { status: 400 }
        )
    }

    try {
        const data = await request.json()
        const client = await clientPromise
        const db = client.db("inventory")

        // Validate required fields
        if (!data.storeName || !data.address) {
            return NextResponse.json(
                { error: 'Store name and address are required' },
                { status: 400 }
            )
        }

        // Ensure mobileNumbers is an array and properly formatted
        const mobileNumbers = Array.isArray(data.mobileNumbers) 
            ? data.mobileNumbers.map(contact => ({
                name: String(contact.name || ""),
                number: String(contact.number || "")
              }))
            : [{ name: "", number: "" }]

        // Prepare the data for storage
        const storeData = {
            storeName: String(data.storeName),
            logo: String(data.logo),
            address: String(data.address),
            mobileNumbers,
            terms: String(data.terms)
        }

        // Update or insert the store document
        const result = await db.collection("store").updateOne(
            {}, // empty filter to match any document
            { $set: storeData },
            { upsert: true } // create if doesn't exist
        )

        if (!result.acknowledged) {
            throw new Error('Database operation failed')
        }

        return NextResponse.json({
            success: true,
            message: 'Store data updated successfully'
        })
    } catch (error) {
        console.error('Database Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update store data' },
            { status: 500 }
        )
    }
}