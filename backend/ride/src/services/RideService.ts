import { Coordinates } from '../interfaces/Coordinates';

import { v4 as uuidv4 } from 'uuid';
import { RideStatus } from '../enums/RideStatus';
import AccountService from './AccountService';
import RideDAO from '../interfaces/DAO/RideDAO';
import RideDAODatabase from '../infra/repository/RideDAODatabase';
import DistanceCalculator from '../utils/DistanceCalculator';
import Ride from '../domain/Ride';

export default class RideService {
  constructor(readonly rideDAO: RideDAO = new RideDAODatabase()) {}

  async requestRide(accountId: string, coordinates: Coordinates) {
    let errorMessage = null;
    let ride: Ride = null;
    try {
      const accountService = new AccountService();
      const account = await accountService.getAccount(accountId);
      if (!account.is_passenger)
        throw new Error('The account id must belong to a passenger');
      const passengerHasRideOnGoing = await this.rideDAO.getByAccountId(
        accountId,
      );
      if (passengerHasRideOnGoing) throw new Error('Another ride is on going');
      Ride.create(
        account.account_id,
        coordinates.from.lat,
        coordinates.from.long,
        coordinates.to.lat,
        coordinates.to.long,
        DistanceCalculator.calculate(coordinates),
        5,
      );
      const response = await this.rideDAO.save(ride);
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
      const accountService = new AccountService();
      const account = await accountService.getAccount(driverId);
      if (!account.is_driver)
        throw new Error('The account id must belong to a driver');
      const ride = await this.rideDAO.getByRideAndPassengerId(
        rideId,
        passengerId,
      );
      ride.accept(driverId);
      const onGoingDriverRide = await this.rideDAO.getDriverRide(driverId);
      if (onGoingDriverRide)
        throw new Error(
          'You must finish your current ride before accepting a new one.',
        );
      updateResponse = await this.rideDAO.update(ride);
    } catch (error) {
      errorMessage = error.message;
    } finally {
      return {
        errorMessage,
        updateResponse,
      };
    }
  }
  async getRide(rideId: string): Promise<Ride> {
    const ride = await this.rideDAO.getById(rideId);
    return ride;
  }
  async getByRideAndPassengerId(
    rideId: string,
    passengerId: string,
  ): Promise<Ride> {
    const ride = await this.rideDAO.getByRideAndPassengerId(
      rideId,
      passengerId,
    );
    return ride;
  }
  async startRide(ride: Ride) {
    try {
      console.log({ ride }, 'starting ride...');
      ride.start();
      console.log({ ride }, 'ride');
      await this.rideDAO.update(ride);
    } catch (error) {
      console.error(error, 'error while trying to start the ride');
      throw new Error(error);
    }
  }
}
