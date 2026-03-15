import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

declare global {
  var mongoose: any;
}

let cached: any;

if (typeof global !== 'undefined' && global.mongoose) {
  cached = global.mongoose;
} else {
  cached = { conn: null, promise: null };
  if (typeof global !== 'undefined') {
    global.mongoose = cached;
  }
}

async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
