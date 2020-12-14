import { Request, Response } from 'express';
import Game, { IGame, IGameLean } from '@models/game';
import Deck from '@models/deck';
import { getCardValue, shuffleArray } from '@shared/Utils';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { v4 as uuidv4 } from 'uuid';

interface IRanking {
  score: number,
  username: String
}

interface IStats {
  [suit: string]: ICardCount[]
}

interface ICardCount {
  card: string,
  qty: number,
  cardLiteralValue: number
}


export class GameController {

  private static async getScore(gameInProgress: IGameLean) {
    const ranking: IRanking[] = [];

    gameInProgress.players.map(playerInfo => {
      let score = playerInfo.cards.reduce((acc, val) => acc + getCardValue(val), 0);
      const playerRank: IRanking = { username: playerInfo.username, score };

      ranking.push(playerRank);
    });

    ranking.sort((a, b) => b.score - a.score);

    return ranking;
  };

  private static async getGameStats(gameInProgress: IGameLean) {
    const cardStats: IStats = { H : [], S: [], C: [], D: []};
    const deckInUse = await Deck.findById(gameInProgress.gameDeckId).lean();

    deckInUse!.availableCards.map((card: string) => {
      const [value, suit] = card;
      if (value && suit) {
        const cardLiteralValue = getCardValue(value);
        const index = (cardLiteralValue - 1);

        if (!cardStats[suit][index]) {
          cardStats[suit][index] = { card: value, cardLiteralValue, qty: 1 };
        } else {
          cardStats[suit][index] = { card: value, cardLiteralValue, qty: cardStats[suit][index].qty + 1 };
        }
      }
    });

    Object.keys(cardStats).map(key => cardStats[key] = cardStats[key].filter(Boolean).reverse());

    return cardStats;
  }

  public async createGame(req: Request, res: Response) {
    const player = res.locals.jwt;
    const { username, _id: playerId } = player;
    const { deckId, title = 'New Game' } = req.body;

    const players = [{ playerId, username, cards: [] }];
    if (!deckId) res.status(400).send({ message: 'deckId is necessary for this operation' });

    const newGame: IGame = await Game.create({
      title,
      gameDeckId: deckId,
      players
    });

    return res.status(200).send(newGame).end();
  }

  public async listGames(req: Request, res: Response) {
    const games = await Game.find({}).lean();
    return res.status(200).send({ games }).end();
  }

  public async getGame(req: Request, res: Response) {
    const { gameId } = req.params;
    const gameInProgress = await Game.findById(gameId).lean();
    if (!gameInProgress) return res.status(404).send({ message: 'Game not found ' });

    const score = await GameController.getScore(gameInProgress);
    const stats = await GameController.getGameStats(gameInProgress);

    return res.status(200).send({ ...gameInProgress, stats, score }).end();
  }

  public async getHand(req: Request, res: Response) {
    const { gameId, username } = req.params;

    const gameInProgress = await Game.findById(gameId);
    if (!gameInProgress) return res.status(404).send({ message: 'Game not found ' });

    const playerHand = gameInProgress.players.find(playerInfo => playerInfo && playerInfo.username === username);
    if (!playerHand) return res.status(404).send({ message: 'Player not found in this Game' });

    return res.status(200).send(playerHand.cards).end();
  }

  public async dealCard(req: Request, res: Response) {
    const { username } = res.locals.jwt;
    const { gameId } = req.params;

    // TODO: add DealCard for Bots;

    const gameInProgress = await Game.findById(gameId);
    if (!gameInProgress) return res.status(404).send({ message: 'Game not found' });

    const deckInUse = await Deck.findById(gameInProgress.gameDeckId);
    if (!deckInUse) return res.status(400).send({ message: 'Game has an Invalid Deck' });

    // Two-level entropy, pick a random number from a pre-shuffled deck;
    const cardIndex = Math.floor(Math.random() * (deckInUse.availableCards.length - 1));
    const card = deckInUse.availableCards[cardIndex];
    const availableCards = [...deckInUse.availableCards];
    availableCards.splice(cardIndex, 1);

    deckInUse.shuffled = true;
    deckInUse.availableCards = [...availableCards];
    deckInUse.usedCards = [...deckInUse.usedCards, card];

    await deckInUse.save();

    gameInProgress.players.map(player => {
      if (player.username === username) {
        player.cards = [...player.cards, card]
      }
    })

    await gameInProgress.save();

    const score = await GameController.getScore(gameInProgress);
    const stats = await GameController.getGameStats(gameInProgress);

    return res.status(200).send({ ...gameInProgress.toObject(), stats, score, gameDeck: deckInUse.toObject() }).end();

  }

  public async shuffleGameDeck(req: Request, res: Response) {
    const { gameId } = req.params;

    const gameInProgress = await Game.findById(gameId).lean();
    if (!gameInProgress) return res.status(404).send({ message: 'Game not found' });

    const deckInUse = await Deck.findById(gameInProgress.gameDeckId);
    if (!deckInUse) return res.status(400).send({ message: 'Game has an Invalid Deck' });

    await deckInUse.update({
      shuffled: true,
      availableCards: shuffleArray([...deckInUse.availableCards])
    })

    return res.status(200).send({ ...gameInProgress, gameDeck: deckInUse }).end();
  }

  public async deleteGame(req: Request, res: Response) {
    const { gameId } = req.params;

    try {
      await Game.deleteOne({ _id: gameId });
      return res.status(200).send().end();
    } catch (error) {
      res.status(400).send({ error }).end();
    }
  }

  public async joinGame(req: Request, res: Response) {
    const { gameId } = req.params;
    const { isBot = false } = req.body;

    const gameInProgress = await Game.findById(gameId);
    if (!gameInProgress) return res.status(404).send({ message: 'Game not found ' });

    if (isBot) {
      const playerId: string = `bot-${uuidv4()}`;

      const username: string = uniqueNamesGenerator({
        dictionaries: [colors, adjectives, animals],
        separator: '',
        style: 'capital'
      });

      await gameInProgress.update({
        players: [...gameInProgress.players, { playerId, username, cards: [] }]
      });

      const score = await GameController.getScore(gameInProgress);
      const stats = await GameController.getGameStats(gameInProgress);

      return res.status(200).send({ ...gameInProgress, stats, score }).end();
    }

    const player = res.locals.jwt;
    const { username, _id: playerId } = player;


    let players = [...gameInProgress.players];

    if (await !gameInProgress.players.find(player => player.playerId == playerId)) {
      players = [...gameInProgress.players, { username, playerId, cards: [] }];
    }

    gameInProgress.players = players;
    gameInProgress.save();

    const score = await GameController.getScore(gameInProgress);
    const stats = await GameController.getGameStats(gameInProgress);

    return res.status(200).send({ ...gameInProgress.toObject(), stats, score }).end();
  }

  public async leaveGame(req: Request, res: Response) {
    const { _id } = res.locals.jwt;
    const { gameId } = req.params;

    const gameInProgress = await Game.findById(gameId);
    if (!gameInProgress) return res.status(404).send({ message: 'Game not found ' });

    await gameInProgress.update({
      players: [...gameInProgress.players].filter(({ playerId }) => playerId !== _id)
    });

    return res.status(200).send(gameInProgress).end();
  }

}
