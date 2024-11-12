import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, setDoc, query, where, orderBy, limit } from 'firebase/firestore';

const COLLECTION_NAME = 'customers';
const STORE_COLLECTION = 'store';

// Generate a new bill number
async function generateBillNumber() {
  const storeDoc = await getDoc(doc(db, STORE_COLLECTION, 'store'));
  if (!storeDoc.exists()) throw new Error('Store not found');

  const storeName = storeDoc.data().storeName || '';
  const prefix = storeName.split(' ').map(word => word[0].toUpperCase()).join('');

  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const currentMonthPrefix = `${prefix}-${year}${month}`;

  const customerQuery = query(
    collection(db, COLLECTION_NAME),
    where('billNumber', '>=', currentMonthPrefix),
    where('billNumber', '<', `${currentMonthPrefix}Z`),
    orderBy('billNumber', 'desc'),
    limit(1)
  );

  const querySnapshot = await getDocs(customerQuery);
  let sequence = '0001';

  if (!querySnapshot.empty) {
    const lastBillNumber = querySnapshot.docs[0].data().billNumber;
    const lastSequence = parseInt(lastBillNumber.slice(-4));
    sequence = (lastSequence + 1).toString().padStart(4, '0');
  }

  return `${currentMonthPrefix}${sequence}`;
}

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
    const billNumber = await generateBillNumber();

    const customerData = {
      ...data,
      billNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newCustomerRef = await addDoc(collection(db, COLLECTION_NAME), customerData);
    return NextResponse.json({ id: newCustomerRef.id, ...customerData }, { status: 201 });
  } catch (error) {
    console.error('POST customers error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
