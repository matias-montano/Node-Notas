import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../features/users/models/user.js';

/**
 * Create a test user
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} - Created user object with token
 */
export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    username: `testuser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'user'
  };
  
  const userToCreate = { ...defaultUser, ...userData };
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userToCreate.password, salt);
  
  // Create and save the user
  const user = await User.create({
    ...userToCreate,
    password: hashedPassword
  });
  
  // Generate token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
  );
  
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    token
  };
};

/**
 * Create a test admin user
 * @returns {Promise<Object>} - Created admin user object with token
 */
export const createTestAdmin = async () => {
  return createTestUser({
    username: `admin${Date.now()}`,
    email: `admin${Date.now()}@example.com`,
    role: 'admin'
  });
};