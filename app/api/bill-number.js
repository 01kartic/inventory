import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const COLLECTION_NAME = 'customers';
const STORE_COLLECTION = 'store';

export async function generateBillNumber() {
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