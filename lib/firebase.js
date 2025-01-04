// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBUp-gx3RzC5wdnCCdOQfLE80TxfuaAMLM",
  authDomain: "inventory-2f298.firebaseapp.com",
  projectId: "inventory-2f298",
  storageBucket: "inventory-2f298.firebasestorage.app",
  messagingSenderId: "599888366979",
  appId: "1:599888366979:web:887bc0d365b19d291f3ab6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };