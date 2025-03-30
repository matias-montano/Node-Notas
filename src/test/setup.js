import { connectTestDB, clearTestDB, closeTestDB } from './config/testConfig.js';

// Setup before all tests
beforeAll(async () => {
  await connectTestDB();
});

// Clean the database between tests
afterEach(async () => {
  await clearTestDB();
});

// Close database connection after all tests
afterAll(async () => {
  await closeTestDB();
});