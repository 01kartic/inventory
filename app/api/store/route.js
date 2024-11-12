import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORE_DOC_ID = 'store'; // Single document ID for store info

export async function GET() {
  try {
    const storeRef = doc(db, 'store', STORE_DOC_ID);
    const storeDoc = await getDoc(storeRef);

    const defaultData = {
      storeName: '',
      logo: '',
      address: '',
      mobileNumbers: [{ name: '', number: '' }],
      terms: ''
    };

    return NextResponse.json(storeDoc.exists() ? storeDoc.data() : defaultData);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch store data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.storeName || !data.address) {
      return NextResponse.json({ error: 'Store name and address are required' }, { status: 400 });
    }

    const storeRef = doc(db, 'store', STORE_DOC_ID);
    await setDoc(storeRef, {
      ...data,
      mobileNumbers: data.mobileNumbers || [],
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, message: 'Store data updated successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update store data' }, { status: 500 });
  }
}
