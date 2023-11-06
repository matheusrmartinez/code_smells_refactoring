import Ride from '../../domain/Ride';

export default interface RideDAO {
  save(ride: any): Promise<Ride>;
  update(ride: any): Promise<void>;
  getByAccountId(rideId: string): Promise<Ride>;
  getById(rideId: string): Promise<Ride>;
  getDriverRide(accountId: string): Promise<Ride>;
  getByRideAndPassengerId(rideId: string, passengerId: string): Promise<Ride>;
}
