import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    register,
    login,
    logout,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/', authMiddleware, getUsers);
router.get('/:id', authMiddleware, getUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;