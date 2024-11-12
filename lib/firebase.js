// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC9hB0dvcJr1NO2i5-L65tlV6OR8GX-X6M",
  authDomain: "inventory-2f298.firebaseapp.com",
  projectId: "inventory-2f298",
  storageBucket: "inventory-2f298.firebasestorage.app",
  messagingSenderId: "599888366979",
  appId: "1:599888366979:web:f8ddd4523c5171f81f3ab6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };