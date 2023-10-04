export interface Ride {
  ride_id: string;
  passenger_id: string;
  driver_id: string;
  status: string;
  fare: number;
  distance: number;
  from_lat: number;
  from_long: number;
  to_lat: number;
  to_long: number;
  date: Date;
}
