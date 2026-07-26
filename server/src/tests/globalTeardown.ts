import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

async function clearAllCollections() {
  const collections = await mongoose.connection.db?.listCollections().toArray();
  if (!collections) return;
  for (const { name } of collections) {
    await mongoose.connection.db?.collection(name).deleteMany({});
  }
}

export default async function globalTeardown() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
  await mongoose.connect(process.env.MONGODB_URI as string);
  await clearAllCollections();
  await mongoose.disconnect();
}
