import crypto from 'crypto';
// import pgp from 'pg-promise';
import { Client } from 'pg';
import CpfValidator from '../utils/CpfValidator';

export default class AccountService {
  cpfValidator: CpfValidator;

  constructor() {
    this.cpfValidator = new CpfValidator();
  }

  async sendEmail(email: string, subject: string, message: string) {
    console.log(email, subject, message);
  }

  async signup(input: any, { shouldSkipCpfValidation = false } = {}) {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'mysecretpassword',
      max: 30, // use up to 30 connections
    });

    await client.connect();

    try {
      const accountId = crypto.randomUUID();
      const verificationCode = crypto.randomUUID();
      const date = new Date();
      let existingAccount = false;

      const res = await client.query(
        `select * from cccat13.account where cpf = '${input.cpf}'`,
      );

      existingAccount = res?.rows?.length > 0;

      if (existingAccount) throw new Error('Account already exists');
      if (!input.name.match(/[a-zA-Z] [a-zA-Z]+/))
        throw new Error('Invalid name');
      if (!input.email.match(/^(.+)@(.+)$/)) throw new Error('Invalid email');
      if (!shouldSkipCpfValidation) {
        if (!this.cpfValidator.validate(input.cpf))
          throw new Error('Invalid cpf');
      }
      if (input.isDriver && !input.carPlate.match(/[A-Z]{3}[0-9]{4}/))
        throw new Error('Invalid plate');
      await client.query(
        'insert into cccat13.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, date, is_verified, verification_code) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [
          accountId,
          input.name,
          input.email,
          input.cpf,
          input.carPlate,
          !!input.isPassenger,
          !!input.isDriver,
          date,
          false,
          verificationCode,
        ],
      );
      await this.sendEmail(
        input.email,
        'Verification',
        `Please verify your code at first login ${verificationCode}`,
      );
      return {
        accountId,
        cpf: input.cpf,
      };
    } catch (error) {
      throw new Error(error.message);
    } finally {
      await client.end();
    }
  }

  async getAccount(accountId: string) {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'mysecretpassword',
      max: 30, // use up to 30 connections
    });

    let account = null;
    let response = null;

    await client.connect();

    try {
      response = await client.query(
        `select * from cccat13.account where account_id = '${accountId}'`,
      );
    } catch (error) {
      console.error(error.message + 'Falha ao buscar conta.');
      throw new Error(error.message);
    } finally {
      await client.end();
      account = response.rows[0];
    }

    return account;
  }
}
