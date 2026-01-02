
import { Router } from 'express';
import { login, setupInitialAdmin, verifyToken, changePassword } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/change-password', changePassword);
router.post('/setup', setupInitialAdmin);
router.get('/verify', verifyToken);

// Middleware to protect routes could be added here if needed
// e.g. router.use(authenticateToken);

export default router;
