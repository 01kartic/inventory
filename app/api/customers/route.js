import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Collection name constant
const COLLECTION_NAME = 'customers';

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("inventory");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      const customers = await db.collection(COLLECTION_NAME).find({}).toArray();
      return NextResponse.json(customers);
    } else {
      try {
        const customer = await db.collection(COLLECTION_NAME).findOne({
          _id: new ObjectId(id)
        });
        
        if (!customer) {
          return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }
        return NextResponse.json(customer);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
      }
    }
  } catch (error) {
    console.error('GET operation error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("inventory");
    const data = await request.json();

    // Generate bill number first to handle any potential errors
    const billNumber = await generateBillNumber(db);

    // Prepare the customer document with timestamps
    const customerData = {
      billNumber,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(customerData);

    if (!result.acknowledged) {
      throw new Error('Failed to insert customer');
    }

    return NextResponse.json(
      { ...customerData, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST operation error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

async function generateBillNumber(db) {
  try {
    const store = await db.collection('store').findOne({});
    
    if (!store || !store.storeName) {
      throw new Error('Store name not found');
    }

    const storeNameWords = store.storeName.split(' ');
    const prefix = storeNameWords.map(word => word[0].toUpperCase()).join('');

    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const currentMonthPrefix = `${prefix}-${year}${month}`;

    const lastCustomer = await db.collection(COLLECTION_NAME)
      .find({ 
        billNumber: { 
          $regex: `^${currentMonthPrefix}` 
        } 
      })
      .sort({ billNumber: -1 })
      .limit(1)
      .toArray();

    let sequence = '0001';
    if (lastCustomer && lastCustomer.length > 0) {
      const lastSequence = parseInt(lastCustomer[0].billNumber.slice(-4));
      sequence = (lastSequence + 1).toString().padStart(4, '0');
    }

    return `${currentMonthPrefix}${sequence}`;
  } catch (error) {
    console.error('Generate bill number error:', error);
    throw new Error('Failed to generate bill number');
  }
}