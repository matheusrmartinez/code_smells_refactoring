import express, { Response, Request } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { signUpRouter } from './controllers/signUpController';

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/signup', signUpRouter);

app.listen(PORT, () => {
  console.log(`backend started on port ${PORT}`);
});
