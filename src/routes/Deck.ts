import { Request, Response, Router } from 'express';
import { DeckController } from '../controllers/deckController';

const { createDeck, getDeck, deleteDeck, listDecks } = new DeckController();

const router = Router();

router.post('/', async (req: Request, res: Response) => createDeck(req, res));

router.get('/', async (req: Request, res: Response) => listDecks(req, res));

router.get('/:deckId', async (req: Request, res: Response) => getDeck(req, res));

router.delete('/:deckId', async (req: Request, res: Response) => deleteDeck(req, res));

export default router;