// app/api/products/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Collection name constant
const COLLECTION_NAME = 'products';

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("inventory");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      const products = await db.collection(COLLECTION_NAME).find({}).toArray();
      return NextResponse.json(products);
    } else {
      try {
        const product = await db.collection(COLLECTION_NAME).findOne({
          _id: new ObjectId(id)
        });
        
        if (!product) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json(product);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
      }
    }
  } catch (error) {
    console.error('GET operation error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("inventory");
    const data = await request.json();

    // Prepare the product document with timestamps
    const productData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(productData);

    if (!result.acknowledged) {
      throw new Error('Failed to insert product');
    }

    return NextResponse.json(
      { ...productData, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST operation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db("inventory");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data = await request.json();
    
    // Add updated timestamp
    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    try {
      const result = await db.collection(COLLECTION_NAME).updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // Fetch the updated document
      const updatedProduct = await db.collection(COLLECTION_NAME).findOne({
        _id: new ObjectId(id)
      });

      return NextResponse.json(updatedProduct);
    } catch (error) {
      console.error('Update operation error:', error);
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
  } catch (error) {
    console.error('PUT operation error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db("inventory");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
      const result = await db.collection(COLLECTION_NAME).deleteOne({
        _id: new ObjectId(id)
      });

      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
  } catch (error) {
    console.error('DELETE operation error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}