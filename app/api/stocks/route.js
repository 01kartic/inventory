import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'stocks';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch a specific stock by ID
      const stockRef = doc(db, COLLECTION_NAME, id);
      const stockDoc = await getDoc(stockRef);

      if (!stockDoc.exists()) {
        return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
      }

      const stockData = stockDoc.data();
      // Convert Firestore timestamps to ISO strings if they exist
      if (stockData.createdAt) stockData.createdAt = stockData.createdAt.toDate().toISOString();
      if (stockData.updatedAt) stockData.updatedAt = stockData.updatedAt.toDate().toISOString();

      return NextResponse.json({ id: stockDoc.id, ...stockData });
    } else {
      // Fetch all stocks
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const stocks = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore timestamps to ISO strings
        if (data.createdAt) data.createdAt = data.createdAt.toDate().toISOString();
        if (data.updatedAt) data.updatedAt = data.updatedAt.toDate().toISOString();
        return { id: doc.id, ...data };
      });

      return NextResponse.json(stocks);
    }
  } catch (error) {
    console.error('GET stocks error:', error);
    return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const stockData = { ...data, createdAt: new Date(), updatedAt: new Date() };
    const newStockRef = await addDoc(collection(db, COLLECTION_NAME), stockData);
    return NextResponse.json({ id: newStockRef.id, ...stockData }, { status: 201 });
  } catch (error) {
    console.error('POST stocks error:', error);
    return NextResponse.json({ error: 'Failed to create stock' }, { status: 500 });
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
    const stockRef = doc(db, COLLECTION_NAME, id);

    await updateDoc(stockRef, updateData);
    const updatedStock = await getDoc(stockRef);

    if (!updatedStock.exists()) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    return NextResponse.json({ id: updatedStock.id, ...updatedStock.data() });
  } catch (error) {
    console.error('PUT stocks error:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
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
    return NextResponse.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    console.error('DELETE stocks error:', error);
    return NextResponse.json({ error: 'Failed to delete stock' }, { status: 500 });
  }
}
