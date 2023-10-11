import express, { Response, Request } from 'express';
import { getAccount } from '../infra/repositories/account';
import AccountService from '../services/AccountService';
import { isUUIDV4Valid } from '../utils/UuidValidator';

export const userRouter = express.Router();

userRouter.post('/signup', async (request: Request, response: Response) => {
  let input = null;

  try {
    input = JSON.parse(JSON.stringify(request.body));
  } catch (error) {
    return response.status(400).json({ response: 'Invalid json format' });
  }

  const accountService = new AccountService();
  const signup = await accountService.signup(input);

  if (signup?.errorMessage) {
    return response.status(400).json({ response: signup.errorMessage });
  }

  return response.status(200).json({
    response: `User created successfully with id ${signup.accountId}`,
  });
});

userRouter.get('/:id', async (request: Request, response: Response) => {
  const userId = request.params?.id;

  if (!isUUIDV4Valid(userId)) {
    return response.status(400).json({ response: 'User id not valid' });
  }

  const userAccount = await getAccount(userId);

  if (!userAccount) {
    return response.status(404).json({ response: 'Account not found' });
  }

  return response.status(200).json({ userAccount });
});
