import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import request from 'supertest';

import app from '../../../app.js';
import { createTestUser } from '../../../test/helpers/authHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testImagePath = path.join(__dirname, '../../../test/fixtures/test-image.jpg');

// Create test image if it doesn't exist
const createTestImage = () => {
  if (!fs.existsSync(testImagePath)) {
    const testDir = path.dirname(testImagePath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create a simple test image (1x1 pixel black image)
    const buffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00,
      0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc2,
      0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14,
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0xff, 0xd9,
    ]);
    fs.writeFileSync(testImagePath, buffer);
  }
};

describe('Image Controller', () => {
  beforeAll(() => {
    createTestImage();
  });

  describe('POST /api/images/upload', () => {
    it('should upload an image', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/images/upload')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('image', testImagePath)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('fileId');
      expect(response.body).toHaveProperty('filename');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/images/upload')
        .attach('image', testImagePath)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/images/profile', () => {
    it('should update user profile image', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/images/profile')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('image', testImagePath)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('profileImage');
      expect(response.body.data.user.profileImage).toHaveProperty('url');
      expect(response.body.data.user.profileImage).toHaveProperty('publicId');
    });
  });
});
