import mongoose, { Schema, Document } from 'mongoose';

export interface IDeck extends Document {
  deckCount: number,
  availableCards: string[],
  usedCards: string[],
  shuffled: boolean
}

const DeckSchema = new Schema({
  deckCount: {
    type: Number,
    default: 1,
    required: true
  },
  shuffled: {
    type: Boolean,
    required: false,
    default: false
  },
  availableCards: [String],
  usedCards: [String]
})

export default mongoose.model<IDeck>('Deck', DeckSchema);
