import { Request, Response, NextFunction } from 'express';
import { decodeToken } from '@shared/Utils';

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = <string>req.headers['authorization'];
  if (!token) return res.status(401).send({ message: 'Unauthorized' });

  let jwtPayload;
  //Try to validate the token and get data
  try {
    jwtPayload = <any>decodeToken(token.replace('Bearer ', ''));
    res.locals.jwt = jwtPayload;
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    console.info(error);
    return res.status(401).send({ message: 'Unauthorized' });
  }

  //Call the next middleware or controller
  next();
};