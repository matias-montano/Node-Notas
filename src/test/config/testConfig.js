import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test database connection
const connectTestDB = async () => {
  try {
    // If there's already an open connection, disconnect first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Use a test-specific database name by appending '-test'
    const dbUrl = `${process.env.DATABASE_URL || 'mongodb://mongo:27017/todo-app'}-test`;

    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    console.log('Connected to test database');
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to test database:', error);
    // Don't exit the process, as this will interrupt Jest
    // Instead, throw the error so Jest can handle it
    throw error;
  }
};

// Clean up the test database
const clearTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

// Disconnect from the test database
const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('Test database connection closed');
  }
};

export { connectTestDB, clearTestDB, closeTestDB };
