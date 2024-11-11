// lib/mongodb.js

import { MongoClient } from 'mongodb'
import os from 'os'

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const iface = interfaces[interfaceName];
    for (const i of iface) {
      if (i.family === 'IPv4' && !i.internal) {
        return i.address;
      }
    }
  }
  return 'localhost'; // fallback if no IP found
}

// Generate MongoDB URI based on local IP address
const ipAddress = getLocalIPAddress();
const defaultMongoPort = '27017';
const defaultMongoDB = 'inventory';

let uri;
if (process.env.MONGODB_URI) {
  uri = process.env.MONGODB_URI;
} else {
  uri = `mongodb://${ipAddress}:${defaultMongoPort}/${defaultMongoDB}`;
}

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local or use a valid IP address');
}

const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable for Hot Module Replacement (HMR).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, do not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
