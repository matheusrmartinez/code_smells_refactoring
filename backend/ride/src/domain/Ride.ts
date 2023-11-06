import crypto from 'crypto';

export default class Ride {
  driverId?: string;

  private constructor(
    readonly rideId: string,
    readonly passengerId: string,
    private status: string,
    readonly fromLat: number,
    readonly fromLong: number,
    readonly toLat: number,
    readonly toLong: number,
    readonly fare: number,
    readonly distance: number,
    readonly date: Date,
  ) {}

  static create(
    passengerId: string,
    fromLat: number,
    fromLong: number,
    toLat: number,
    toLong: number,
    distance: number,
    fare: number,
  ) {
    const rideId = crypto.randomUUID();
    const status = 'requested';
    const date = new Date();
    return new Ride(
      rideId,
      passengerId,
      status,
      fromLat,
      fromLong,
      toLat,
      toLong,
      distance,
      fare,
      date,
    );
  }

  static restore(
    rideId: string,
    passengerId: string,
    driverId: string,
    status: string,
    fromLat: number,
    fromLong: number,
    toLat: number,
    toLong: number,
    fare: number,
    distance: number,
    date: Date,
  ): Ride {
    const ride = new Ride(
      rideId,
      passengerId,
      status,
      fromLat,
      fromLong,
      toLat,
      toLong,
      fare,
      distance,
      date,
    );
    ride.driverId = driverId;
    return ride;
  }

  accept(driverId: string) {
    if (this.status !== 'requested')
      throw new Error('The ride is not requested');
    this.driverId = driverId;
    this.status = 'accepted';
  }

  start() {
    if (this.status !== 'accepted') throw new Error('The ride is not accepted');
    this.status = 'in_progress';
  }

  getStatus() {
    return this.status;
  }
}
