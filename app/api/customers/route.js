import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, setDoc, query, where, orderBy, limit } from 'firebase/firestore';

const COLLECTION_NAME = 'customers';

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const customers = snapshot.docs.map(doc => {
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
    return NextResponse.json(customers);
  } catch (error) {
    console.error('GET customers error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const customerData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newCustomerRef = await addDoc(collection(db, COLLECTION_NAME), customerData);
    
    return NextResponse.json({
      id: newCustomerRef.id,
      ...customerData
    }, { status: 201 });
  } catch (error) {
    console.error('POST customers error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}