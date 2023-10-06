import { getAccount } from '../infra/repositories/account';
import { addRide, getRide } from '../infra/repositories/ride';
import { Coordinates } from '../interfaces/Coordinates';

import { v4 as uuidv4 } from 'uuid';
import { Ride } from '../interfaces/Ride';
import { RideStatus } from '../enums/RideStatus';

export default class RideService {
  async requestRide(account_id: string, coordinates: Coordinates) {
    const account = await getAccount(account_id);

    if (!account.is_passenger)
      throw new Error('The account id must belong to a passenger');

    const passengerHasRideOnGoing = await getRide(account_id);

    if (passengerHasRideOnGoing) throw new Error('Another ride is on going');

    const rideUUID = uuidv4();

    const ride: Ride = {
      date: new Date(),
      fare: 4,
      distance: 5,
      from_lat: coordinates.from.lat,
      from_long: coordinates.from.long,
      to_lat: coordinates.to.lat,
      to_long: coordinates.to.long,
      ride_id: rideUUID,
      status: RideStatus.REQUESTED,
      passenger_id: account.account_id,
      driver_id: null,
    };

    const response = await addRide(ride);
    return response;
  }
}
