import { Request, Response } from 'express';
import Deck, { IDeck } from '@models/deck';
import Game from '@models/game';
import { shuffleArray } from '@shared/Utils';

export const cards = [
  'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '0S', 'JS', 'QS', 'KS',
  'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '0D', 'JD', 'QD', 'KD',
  'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '0C', 'JC', 'QC', 'KC',
  'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '0H', 'JH', 'QH', 'KH'
];

Object.freeze(cards);

export class DeckController {
  private static shuffleCards(cards: string[]): string[] {
    return shuffleArray(cards);
  }

  public async createDeck(req: Request, res: Response) {
    const { deckCount = 1, shuffled = true } = req.body;

    let availableCards = new Array(Number(deckCount)).fill('').map(() => [...cards]).flat(2);

    if (shuffled) availableCards = DeckController.shuffleCards(availableCards)

    const newDeck: IDeck = await Deck.create({
      deckCount,
      availableCards,
      usedCards: [],
      shuffled
    });

    return res.status(200).send(newDeck).end()
  }

  public async getDeck(req: Request, res: Response) {
    const { deckId } = req.params;
    const currentDeck = await Deck.findById(deckId).lean();
    if (currentDeck) return res.status(200).send(currentDeck).end()
    return res.status(404).send({ message: 'Deck not found '});
  }

  public async listDecks(req: Request, res: Response) {
    const decks = await Deck.find({}).lean();
    return res.status(200).send({ decks }).end();
  }

  public async deleteDeck(req: Request, res: Response) {
    const { deckId } = req.params;
    const currentDeck = await Deck.findById(deckId)
    if (!currentDeck) return res.status(404).send({ message: 'Deck not found '});

    const hasGame = await Game.findOne({ gameDeckId: deckId });
    if (hasGame) return res.status(400).send({ message: 'Deck currently in use' });

    currentDeck.delete();
    return res.status(200).send(currentDeck).end();
  }
}
