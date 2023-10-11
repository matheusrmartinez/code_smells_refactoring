import express, { Response, Request } from 'express';
import { getRide } from '../infra/repositories/ride';
import RideService from '../services/RideService';

export const rideRouter = express.Router();

rideRouter.post('/request', async (request: Request, response: Response) => {
  let input = null;

  try {
    input = JSON.parse(JSON.stringify(request.body));
  } catch (error) {
    return response.status(400).json({ response: 'Invalid json format' });
  }

  if (!(input?.accountId || input?.coordinates))
    return response.status(400).json({ response: 'Missing fields' });

  const { errorMessage, ride } = await new RideService().requestRide(
    input.accountId,
    input.coordinates,
  );

  if (errorMessage) {
    return response.status(400).json({ response: errorMessage });
  }

  return response
    .status(201)
    .json({ response: `Ride id ${ride.ride_id} requested successfully!` });
});

rideRouter.post('/accept', async (request: Request, response: Response) => {
  let input = null;

  try {
    input = JSON.parse(JSON.stringify(request.body));
  } catch (error) {
    return response.status(400).json({ response: 'Invalid json format' });
  }

  if (!(input?.rideId || input?.driverId || input?.passengerId))
    return response.status(400).json({ response: 'Missing fields' });

  const { errorMessage } = await new RideService().acceptRide(
    input.rideId,
    input.driverId,
    input.passengerId,
  );

  if (errorMessage) {
    return response.status(400).json({ response: errorMessage });
  }

  return response.status(200).json({
    response: `Ride id ${input.rideId} accepted successfully!`,
  });
});
