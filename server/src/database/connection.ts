import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from '../config/env.js';

let mongodInstance: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    mongoose.set('strictQuery', true);
    
    // Attempt connecting to the configured URI (MongoDB local or Atlas)
    console.log(`Connecting to MongoDB at: ${config.mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
    
    // Test with a quick 4-second timeout to fallback seamlessly to in-memory MongoDB if local daemon is not running
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log('Successfully connected to primary MongoDB server.');
    return conn;
  } catch (err: unknown) {
    const error = err as Error;
    console.warn(`Primary MongoDB connection failed (${error.message}). Initializing embedded MongoMemoryServer for development/testing environment...`);
    
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    console.log(`Embedded MongoMemoryServer initialized at: ${uri}`);
    const conn = await mongoose.connect(uri);
    console.log('Successfully connected to embedded MongoMemoryServer.');
    return conn;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
