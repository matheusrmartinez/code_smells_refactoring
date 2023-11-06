import Ride from '../../domain/Ride';
import RideDAO from '../../interfaces/DAO/RideDAO';
import ClientDB from '../../utils/client_db';

export default class RideDAODatabase implements RideDAO {
  constructor() {}
  async getByAccountId(accountId: string): Promise<Ride> {
    let data: any = null;
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

    console.log(query, 'query para buscar a corrida pela conta do passageiro');

    try {
      response = await client.query(query);
    } catch (error) {
      throw new Error(`Falha ao buscar corrida.': ${error.message}`);
    } finally {
      await client.end();
      if (!response?.rows) {
        return null;
      }
      data = response.rows[0];
      const ride = Ride.restore(
        data.ride_id,
        data.passenger_id,
        data.driver_id,
        data.status,
        parseFloat(data.from_lat),
        parseFloat(data.from_long),
        parseFloat(data.to_lat),
        parseFloat(data.to_long),
        data.fare,
        data.distance,
        data.date,
      );
      return ride;
    }
  }
  async getById(rideId: string): Promise<Ride> {
    let data: any = null;
    let response = null;
    const client = await new ClientDB().getClient();
    await client.connect();
    const query = `select * 
    from cccat13.ride as Ride 
    INNER JOIN cccat13.account as Account ON 
     Ride.passenger_id = Account.account_id
    where Ride.ride_id = '${rideId}' 
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
      data = response.rows[0];
      const ride = Ride.restore(
        data.ride_id,
        data.passenger_id,
        data.driver_id,
        data.status,
        parseFloat(data.from_lat),
        parseFloat(data.from_long),
        parseFloat(data.to_lat),
        parseFloat(data.to_long),
        data.fare,
        data.distance,
        data.date,
      );

      return ride;
    }
  }
  async getByRideAndPassengerId(
    rideId: string,
    passengerId: string,
  ): Promise<Ride> {
    let data: any = null;
    let response = null;

    const client = await new ClientDB().getClient();
    await client.connect();

    const query = `select * 
    from cccat13.ride as Ride 
    INNER JOIN cccat13.account as Account ON 
     Ride.passenger_id = Account.account_id
    where Ride.ride_id = '${rideId}' 
    and Ride.passenger_id = '${passengerId}' 
    and Ride.status != 'completed'
    `;

    console.log(query, 'query');

    try {
      response = await client.query(query);
    } catch (error) {
      throw new Error(`Falha ao buscar corrida pelo id.': ${error.message}`);
    } finally {
      await client.end();
      if (!response?.rows) {
        return null;
      }
      data = response.rows[0];
      const ride = Ride.restore(
        data.ride_id,
        data.passenger_id,
        data.driver_id,
        data.status,
        parseFloat(data.from_lat),
        parseFloat(data.from_long),
        parseFloat(data.to_lat),
        parseFloat(data.to_long),
        data.fare,
        data.distance,
        data.date,
      );

      return ride;
    }
  }
  async save(ride: Ride): Promise<Ride> {
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
                '${ride.rideId}', 
                '${ride.passengerId}', 
                ${ride.driverId}, 
                '${ride.getStatus()}', 
                ${ride.fare}, 
                ${ride.distance}, 
                ${ride.fromLat}, 
                ${ride.fromLong}, 
                ${ride.toLat}, 
                ${ride.toLong}, 
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
  }
  async update(ride: Ride) {
    const client = await new ClientDB().getClient();
    await client.connect();
    let query = null;
    let response = null;

    try {
      query = `update cccat13.ride 
               set driver_id = '${ride.driverId}',
                   status = '${ride.getStatus()}'
               where ride_id = '${ride.rideId}'
       `;

      console.log(query, 'query');
      response = await client.query(query);
      console.log(response, 'response');
    } catch (error) {
      response = null;
      throw new Error(`Failed to start ride': ${error.message}`);
    } finally {
      await client.end();
    }
    return response;
  }
  async getDriverRide(accountId: string): Promise<Ride> {
    let data: any = null;
    let response = null;

    const client = await new ClientDB().getClient();
    await client.connect();

    const query = `select * 
    from cccat13.ride as Ride 
    INNER JOIN cccat13.account as Account ON 
     Ride.driver_id = Account.account_id
    where Ride.driver_id = '${accountId}' 
    and Ride.status = 'ACCEPTED' or Ride.status = 'IN_PROGRESS' 
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
      data = response.rows[0];
      const ride = Ride.restore(
        data.ride_id,
        data.passenger_id,
        data.driver_id,
        data.status,
        parseFloat(data.from_lat),
        parseFloat(data.from_long),
        parseFloat(data.to_lat),
        parseFloat(data.to_long),
        data.fare,
        data.distance,
        data.date,
      );
      return ride;
    }
  }
}
