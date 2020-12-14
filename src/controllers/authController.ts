import { Request, Response } from 'express';
import User, { IUser } from '@models/user';
import bcrypt from 'bcryptjs';
import { encodeToken } from '@shared/Utils';

export class AuthController {
  private static hashPassword(password: string) {
    return bcrypt.hashSync(password, 8);
  };

  public async getUser(req: Request, res: Response) {
    const currentToken = <string>req.headers['authorization'];
    const token = currentToken.replace('Bearer ', '');
    const player = res.locals.jwt;
    return res.status(200).send({ ...player, token });
  }

  public async createUser(req: Request, res: Response) {
    const { username, password } = req.body;
    const hashedPassword = AuthController.hashPassword(password);

    if (!username) return res.status(400).send({ message: 'Missing Username ' }).end();
    if (!password) return res.status(400).send({ message: 'Missing Password ' }).end();

    try {
      const newUser: IUser = await User.create({
        username,
        password: hashedPassword
      });

      res.status(200).send({ username: newUser.username, _id: newUser._id, token: encodeToken(newUser) });
    } catch (e) {
      res.status(409).send({ message: 'username already in use' });
    }
  }

  public async authenticateUser(req: Request, res: Response) {
    const { username, password } = req.body;
    if (!username) return res.status(400).send({ message: 'Missing Username ' }).end();
    if (!password) return res.status(400).send({ message: 'Missing Password ' }).end();

    try {
      const user = await User.findOne({ username }).lean();

      bcrypt.compare(password, `${user!.password}`, (err, matchPassword) => {
        if (!matchPassword) res.status(401).send({ message: 'Invalid Credentials' });
        return res.status(200).send({ ...user, token: encodeToken(user) }).end;
      });

    } catch (e) {
      console.error(e);
      res.status(401).send({ message: 'Invalid Credentials' });
    }
  }
}

