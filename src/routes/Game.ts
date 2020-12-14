import { Request, Response, Router } from 'express';
import { GameController } from '../controllers/gameController';

const {
  createGame,
  dealCard,
  getGame,
  listGames,
  getHand,
  shuffleGameDeck,
  deleteGame,
  joinGame,
  leaveGame
} = new GameController();

const router = Router();

router.get('/', async (req: Request, res: Response) => listGames(req, res));

router.get('/:gameId', async (req: Request, res: Response) => getGame(req, res));

router.get('/:gameId/hand/:username', async (req: Request, res: Response) => getHand(req, res));

router.post('/', async (req: Request, res: Response) => createGame(req, res));

router.post('/:gameId/deal', async (req: Request, res: Response) => dealCard(req, res));

router.post('/:gameId/shuffle', async (req: Request, res: Response) => shuffleGameDeck(req, res));

router.put('/:gameId/join', async (req: Request, res: Response) => joinGame(req, res));

router.put('/:gameId/leave', async (req: Request, res: Response) => leaveGame(req, res));

router.delete('/:gameId', async (req: Request, res: Response) => deleteGame(req, res));

export default router;