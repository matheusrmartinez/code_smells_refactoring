import express, { Response, Request } from 'express';

export const signUpRouter = express.Router();

signUpRouter.get('/', (request: Request, response: Response) => {
  const { title } = request.query;

  return response.status(200).json({ response: 'Signup route' });
});

signUpRouter.post('/', (request: Request, response: Response) => {
  const { title } = request.query;

  return response.status(200).json({ response: 'Signup route' });
});
