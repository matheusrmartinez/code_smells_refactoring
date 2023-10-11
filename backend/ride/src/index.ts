import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import { rideRouter } from './controllers/rideController';
import { userRouter } from './controllers/userController';

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/user', userRouter);
app.use('/api/ride', rideRouter);

app.listen(PORT, () => {
  console.log(`backend started on port ${PORT}`);
});
