import { Account } from '../../interfaces/Account';
import AccountDAO from '../../interfaces/AccountDAO';
import ClientDB from '../../utils/client_db';

export default class AccountDAODatabase implements AccountDAO {
  constructor() {}

  async getById(accountId: string): Promise<Account> {
    let account: Promise<Account> = null;
    let response = null;
    let client = null;
    const query = `select * from cccat13.account where account_id = '${accountId}'`;
    try {
      client = await new ClientDB().getClient();
      await client.connect();
      response = await client.query(query);
    } catch (error) {
      throw new Error(`'Falha ao buscar conta.' ${error.message}`);
    } finally {
      await client.end();
      account = response?.rows[0];
    }
    return account;
  }

  async getByCpf(cpf: string): Promise<Account> {
    let account: Promise<Account> = null;
    let response = null;
    let client = null;

    try {
      client = await new ClientDB().getClient();
      await client.connect();
      response = await client.query(
        `select * from cccat13.account where cpf = '${cpf}'`,
      );
    } catch (error) {
      throw new Error(`Falha ao buscar conta pelo cpf. ${error.message}`);
    } finally {
      await client.end();
      account = response.rows[0];
    }
    return account;
  }

  async save(account: any) {
    let client = null;
    try {
      client = await new ClientDB().getClient();
      console.log({ account }, 'account log');
      await client.connect();
      await client.query(
        'insert into cccat13.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, date, is_verified, verification_code) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [
          account.accountId,
          account.name,
          account.email,
          account.cpf,
          account.carPlate,
          !!account.isPassenger,
          !!account.isDriver,
          account.date,
          false,
          account.verificationCode,
        ],
      );
    } catch (error) {
      throw new Error(`Falha ao salvar os dados do usuário. ${error.message}`);
    } finally {
      await client.end();
    }
  }
}
