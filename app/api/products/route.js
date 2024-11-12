import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'products';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch a specific product by ID
      const productRef = doc(db, COLLECTION_NAME, id);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const productData = productDoc.data();
      // Convert Firestore timestamps to ISO strings
      if (productData.createdAt) {
        productData.createdAt = productData.createdAt.toDate().toISOString();
      }
      if (productData.updatedAt) {
        productData.updatedAt = productData.updatedAt.toDate().toISOString();
      }

      return NextResponse.json({ id: productDoc.id, ...productData });
    } else {
      // Fetch all products
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const products = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore timestamps to ISO strings
        if (data.createdAt) {
          data.createdAt = data.createdAt.toDate().toISOString();
        }
        if (data.updatedAt) {
          data.updatedAt = data.updatedAt.toDate().toISOString();
        }
        return { id: doc.id, ...data };
      });

      return NextResponse.json(products);
    }
  } catch (error) {
    console.error('GET products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const productData = { ...data, createdAt: new Date(), updatedAt: new Date() };
    const newProductRef = await addDoc(collection(db, COLLECTION_NAME), productData);
    return NextResponse.json({ id: newProductRef.id, ...productData }, { status: 201 });
  } catch (error) {
    console.error('POST products error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const data = await request.json();
    const updateData = { ...data, updatedAt: new Date() };
    const productRef = doc(db, COLLECTION_NAME, id);

    await updateDoc(productRef, updateData);
    const updatedProduct = await getDoc(productRef);
    
    if (!updatedProduct.exists()) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ id: updatedProduct.id, ...updatedProduct.data() });
  } catch (error) {
    console.error('PUT products error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DELETE products error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
