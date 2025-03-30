import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../app.js';
import { createTestUser, createTestAdmin } from '../../../test/helpers/authHelpers.js';

describe('User Controller', () => {
  describe('GET /api/users', () => {
    it('should get all users as admin', async () => {
      // Create a test admin user
      const admin = await createTestAdmin();
      
      // Create some test users
      await createTestUser();
      await createTestUser();
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 403 for non-admin users', async () => {
      // Create a regular user
      const user = await createTestUser();
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID as admin', async () => {
      const admin = await createTestAdmin();
      const testUser = await createTestUser();
      
      const response = await request(app)
        .get(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id.toString()).toBe(testUser._id.toString());
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const admin = await createTestAdmin();
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users', () => {
    it('should create new user as admin', async () => {
      const admin = await createTestAdmin();
      
      const newUserData = {
        username: 'createdbytest',
        email: 'createdbytest@example.com',
        password: 'newpassword123',
        firstName: 'Created',
        lastName: 'ByTest',
        role: 'user'
      };
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${admin.token}`)
        .send(newUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(newUserData.username);
      expect(response.body.data.email).toBe(newUserData.email);
      expect(response.body.data).not.toHaveProperty('password');
    });
  });
});