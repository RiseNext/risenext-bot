import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log("⚠️ MongoDB URI not provided, skipping DB connection");
    return;
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    dbName: 'risenext_bot'
  });

  console.log('✅ MongoDB connected');
}
