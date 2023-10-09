import { Ride } from '../../interfaces/Ride';
import ClientDB from '../../utils/client_db';

export const getRide = async (accountId: string): Promise<Ride> => {
  let ride: Ride = null;
  let response = null;

  const client = await new ClientDB().getClient();
  await client.connect();

  const query = `select * 
  from cccat13.ride as Ride 
  INNER JOIN cccat13.account as Account ON 
   Ride.passenger_id = Account.account_id
  where Ride.passenger_id = '${accountId}' 
  and Ride.status != 'completed'
  `;

  try {
    response = await client.query(query);
  } catch (error) {
    throw new Error(`Falha ao buscar corrida.': ${error.message}`);
  } finally {
    await client.end();
    if (!response?.rows) {
      return null;
    }
    ride = response.rows[0];
  }

  return ride as Ride;
};

export const getRideById = async (
  rideId: string,
  passengerId: string,
): Promise<Ride> => {
  let ride: Ride = null;
  let response = null;

  const client = await new ClientDB().getClient();
  await client.connect();

  const query = `select * 
  from cccat13.ride as Ride 
  INNER JOIN cccat13.account as Account ON 
   Ride.passenger_id = Account.account_id
  where Ride.ride_id = '${rideId}' and Ride.passenger_id = '${passengerId}' 
  and Ride.status != 'completed'
  `;

  try {
    response = await client.query(query);
  } catch (error) {
    throw new Error(`Falha ao buscar corrida pelo id.': ${error.message}`);
  } finally {
    await client.end();
    if (!response?.rows) {
      return null;
    }
    console.log(response.rows[0], 'rows returned');
    ride = response.rows[0];
  }

  return ride as Ride;
};
export const addRide = async (ride: Ride) => {
  const client = await new ClientDB().getClient();
  await client.connect();
  let query = null;

  try {
    query = `insert into cccat13.ride 
    (
      ride_id, 
      passenger_id, 
      driver_id, 
      status, 
      fare, 
      distance, 
      from_lat, 
      from_long, 
      to_lat, 
      to_long,
      date
     )
     VALUES (
              '${ride.ride_id}', 
              '${ride.passenger_id}', 
              ${ride.driver_id}, 
              '${ride.status}', 
              ${ride.fare}, 
              ${ride.distance}, 
              ${ride.from_lat}, 
              ${ride.from_long}, 
              ${ride.to_lat}, 
              ${ride.to_long}, 
              '${ride.date.toISOString()}'
            ) 
     `;

    await client.query(query);
  } catch (error) {
    ride = null;
    throw new Error(`Falha ao criar corrida.': ${error.message}`);
  } finally {
    await client.end();
  }

  return ride;
};
export const updateRide = async (ride: Ride) => {
  const client = await new ClientDB().getClient();
  await client.connect();
  let query = null;

  try {
    query = `update cccat13.ride 
             set driver_id = '${ride.driver_id}',
                 status = '${ride.status}'
             where ride_id = '${ride.ride_id}'
     `;

    await client.query(query);
  } catch (error) {
    ride = null;
    throw new Error(`Falha ao atualizar corrida.': ${error.message}`);
  } finally {
    await client.end();
  }

  return ride;
};
export const getDriverRide = async (accountId: string): Promise<Ride> => {
  let ride: Ride = null;
  let response = null;

  const client = await new ClientDB().getClient();
  await client.connect();

  const query = `select * 
  from cccat13.ride as Ride 
  INNER JOIN cccat13.account as Account ON 
   Ride.driver_id = Account.account_id
  where Ride.driver_id = '${accountId}' 
  and Ride.status == 'ACCEPTED' or Ride.status == 'IN_PROGRESS' 
  `;

  try {
    response = await client.query(query);
  } catch (error) {
    throw new Error(`Falha ao buscar corridas do driver.': ${error.message}`);
  } finally {
    await client.end();
    if (!response?.rows) {
      return null;
    }
    ride = response.rows[0];
  }

  return ride as Ride;
};
