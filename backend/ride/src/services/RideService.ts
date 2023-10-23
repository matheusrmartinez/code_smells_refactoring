import { getById } from '../infra/DAO/AccountDAO';
import {
  addRide,
  getDriverRide as getDriverRide,
  getRide,
  getRideById,
  updateRide,
} from '../infra/DAO/RideDAO';
import { Coordinates } from '../interfaces/Coordinates';

import { v4 as uuidv4 } from 'uuid';
import { Ride } from '../interfaces/Ride';
import { RideStatus } from '../enums/RideStatus';

export default class RideService {
  async requestRide(accountId: string, coordinates: Coordinates) {
    let errorMessage = null;
    let ride: Ride = null;

    try {
      const account = await getById(accountId);

      if (!account.is_passenger)
        throw new Error('The account id must belong to a passenger');

      const passengerHasRideOnGoing = await getRide(accountId);

      if (passengerHasRideOnGoing) throw new Error('Another ride is on going');

      const rideUUID = uuidv4();

      ride = {
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
    } catch (error) {
      errorMessage = error.message;
      return errorMessage;
    } finally {
      return {
        ride,
        errorMessage,
      };
    }
  }
  async acceptRide(rideId: string, driverId: string, passengerId: string) {
    let errorMessage = null;
    let updateResponse = null;

    try {
      const account = await getById(driverId);

      if (!account.is_driver)
        throw new Error('The account id must belong to a driver');

      const ride = await getRideById(rideId, passengerId);

      if (ride.status !== RideStatus.REQUESTED)
        throw new Error('The ride status should be requested');

      const onGoingDriverRide = await getDriverRide(driverId);

      if (onGoingDriverRide)
        throw new Error(
          'You must finish your current ride before accepting a new one.',
        );

      const updatedRide: Ride = {
        ...ride,
        driver_id: driverId,
        status: RideStatus.ACCEPTED,
      };

      updateResponse = await updateRide(updatedRide);
    } catch (error) {
      errorMessage = error.message;
    } finally {
      return {
        errorMessage,
        updateResponse,
      };
    }
  }
}
