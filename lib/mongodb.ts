import { MongoClient } from 'mongodb';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please add your MongoDB URI to environment variables. Expected MONGODB_URI.');
}

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // Increase timeout for production
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000, // Increase connection timeout
  retryWrites: true,
  retryReads: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
  
  // Add connection error handling for production
  clientPromise.catch((error) => {
    console.error('MongoDB connection failed:', error);
    throw error;
  });
}

export default clientPromise; 