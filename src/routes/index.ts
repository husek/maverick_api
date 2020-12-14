import { Router } from 'express';
import DeckRouter from './Deck';
import GameRouter from './Game';
import AuthRouter from './Auth';
import { checkJwt } from '../middlewares/checkJwt';

const router = Router();
router.use('/auth/', AuthRouter);
router.use('/game/', [checkJwt], GameRouter);
router.use('/deck/', [checkJwt], DeckRouter);

export default router;