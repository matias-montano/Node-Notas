import express from 'express';

import {
  register,
  login,
  getUserProfile,
  updateUserProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.route('/me').get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;
