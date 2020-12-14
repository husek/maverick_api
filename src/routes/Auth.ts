import { Request, Response, Router } from 'express';
import { AuthController } from '../controllers/authController';
import { checkJwt } from '../middlewares/checkJwt';
const { createUser, authenticateUser, getUser } = new AuthController();

const router = Router();

router.get('/me', [checkJwt], async (req: Request, res: Response) => getUser(req, res));
router.post('/login', async (req: Request, res: Response) => authenticateUser(req, res));
router.post('/register', async (req: Request, res: Response) => createUser(req, res));

export default router;