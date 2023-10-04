import { Client } from 'pg';
import * as dotenv from 'dotenv';

export default class ClientDB {
  constructor() {
    dotenv.config();
  }

  getClient() {
    const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: process.env.DB_MAX_CONNECTIONS,
    });

    return client;
  }
}
