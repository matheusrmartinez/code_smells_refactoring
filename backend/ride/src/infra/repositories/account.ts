import ClientDB from '../../utils/client_db';

export const getAccount = async (accountId: string) => {
  let account = null;
  let response = null;

  const client = await new ClientDB().getClient();
  console.log(client, 'client');
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
};
