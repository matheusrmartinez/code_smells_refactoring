import express, { Response, Request } from 'express';

export const userRouter = express.Router();

userRouter.get('/', (request: Request, response: Response) => {
  const { title } = request.query;

  return response.status(200).json({ response: 'User route' });
});

userRouter.get('/signup', (request: Request, response: Response) => {
  const { title } = request.query;

  return response.status(200).json({ response: 'Signup route' });
});
