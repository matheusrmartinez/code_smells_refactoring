import { Account } from '../../interfaces/Account';
import ClientDB from '../../utils/client_db';

export const getAccount = async (accountId: string) => {
  let account: Promise<Account> = null;
  let response = null;

  const client = await new ClientDB().getClient();
  await client.connect();

  const query = `select * from cccat13.account where account_id = '${accountId}'`;

  try {
    response = await client.query(query);
  } catch (error) {
    throw new Error(`'Falha ao buscar conta.' ${error.message}`);
  } finally {
    await client.end();
    account = response?.rows[0];
  }

  return account;
};
export const getAccountByCpf = async (cpf: string): Promise<Account> => {
  let account: Promise<Account> = null;
  let response = null;

  const client = await new ClientDB().getClient();
  await client.connect();

  try {
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
};
