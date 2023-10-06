import { Ride } from '../../interfaces/Ride';
import ClientDB from '../../utils/client_db';

export const getRide = async (
  accountId: string,
  isPassenger: boolean = true,
): Promise<Ride> => {
  let ride: Ride = null;
  let response = null;
  let driverPassengerJoinerFilter = isPassenger ? 'passenger_id' : 'driver_id';

  const client = await new ClientDB().getClient();
  await client.connect();

  const query = `select * 
  from cccat13.ride as Ride 
  INNER JOIN cccat13.account ON 
   Ride.${driverPassengerJoinerFilter} = account.account_id
  where Ride.${driverPassengerJoinerFilter} = '${accountId}' and 
  Ride.status != 'completed'
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
    console.log(query, 'query');
    throw new Error(`Falha ao criar corrida.': ${error.message}`);
  } finally {
    await client.end();
  }

  return ride;
};
