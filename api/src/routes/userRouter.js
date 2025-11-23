import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import {
    register,
    login,
    logout,
    getProfile,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/profile', authMiddleware, getProfile);
router.get('/', authMiddleware, getUsers);
router.get('/:id', authMiddleware, adminMiddleware, getUser);
router.put('/:id', authMiddleware, adminMiddleware, updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

export default router;