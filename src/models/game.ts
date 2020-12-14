import mongoose, { Schema, Document, LeanDocument } from 'mongoose';

interface GamePlayer {
  playerId: string,
  username: string
  cards: string[]
}
export interface IGame extends Document {
  title: string,
  gameDeckId: string,
  players: GamePlayer[]
}

export interface IGameLean extends LeanDocument<IGame>{}

const GameSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  gameDeckId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  players: {
    type: [{
      playerId: mongoose.Types.ObjectId,
      username: String,
      cards: [String]
    }]
  }
})

export default mongoose.model<IGame>('Game', GameSchema);
