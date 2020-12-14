import jwt from 'jwt-simple';
import { IUserJWT, IUser } from '@models/user';

export function shuffleArray(incomingArray: any[]) {
  // simple Durstenfeld // Fisher–Yates algorithm for shuffling arrays.
  if (!Array.isArray(incomingArray)) throw new Error(`${typeof incomingArray} ain't no array`);
  let array = [...incomingArray];

  for (let index = (array.length - 1); index > 0; index--) {
    const updatedIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[updatedIndex]] = [array[updatedIndex], array[index]];
  }

  return array;
}

export function encodeToken(user: IUserJWT|IUser|null) {
  if (!user) throw new Error ('Invalid User passed to encodedToken');
  return jwt.encode({ _id: user._id, username: user.username }, `${process.env.JWT_SECRET}`);
}

export function decodeToken(token: string) {
  return jwt.decode(token, `${process.env.JWT_SECRET}`);
}

export function getCardValue(card: string): number {
  if (card[0] === '0') return 10;

  if (Number(card[0])) {
    return Number(card[0]);
  }
  switch (card[0]) {
    case 'A': return 1;
    case 'J': return 11;
    case 'Q': return 12;
    case 'K': return 13;
    default: return 0;
  }
}

