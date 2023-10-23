import { RideStatus } from '../../src/enums/RideStatus';
import { getRideById } from '../../src/infra/DAO/RideDAO';
import AccountService from '../../src/services/AccountService';
import RideService from '../../src/services/RideService';
import { getDriverMock } from '../mocks/driverMock';
import { getPassengerMock } from '../mocks/passengerMock';

describe('Ride Service', () => {
  describe('requestRide', () => {
    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('deve retornar um erro caso o passageiro já possua uma corrida em andamento', async () => {
      const passengerMocked = getPassengerMock();

      const { accountId } = await new AccountService().signup(passengerMocked, {
        shouldSkipCpfValidation: true,
      });

      let rideService = new RideService();

      await rideService.requestRide(accountId, {
        from: { lat: 2, long: 3 },
        to: { lat: 4, long: 5 },
      });

      const requestRideResponse = await rideService.requestRide(accountId, {
        from: { lat: 2, long: 3 },
        to: { lat: 4, long: 5 },
      });

      expect(requestRideResponse).toHaveProperty(
        'errorMessage',
        'Another ride is on going',
      );

      rideService = null;
    });
    it('deve retornar erro caso a corrida seja solicitada por uma conta de não passageiro', async () => {
      const driverMocked = { ...getDriverMock(), cpf: Math.random() };

      const { accountId } = await new AccountService().signup(driverMocked, {
        shouldSkipCpfValidation: true,
      });

      let rideService = new RideService();

      const requestRideResponse = await rideService.requestRide(accountId, {
        from: { lat: 2, long: 3 },
        to: { lat: 4, long: 5 },
      });

      expect(requestRideResponse).toHaveProperty(
        'errorMessage',
        'The account id must belong to a passenger',
      );
      rideService = null;
    });
    it('deve retornar uma corrida caso seja um passageiro e não tenha corrida em andamento', async () => {
      const passengerMocked = getPassengerMock();

      const { accountId } = await new AccountService().signup(passengerMocked, {
        shouldSkipCpfValidation: true,
      });

      const rideService = new RideService();

      const { ride } = await rideService.requestRide(accountId, {
        from: { lat: 2, long: 3 },
        to: { lat: 4, long: 5 },
      });

      expect(ride.passenger_id).toBe(accountId);
    });
  });

  describe('acceptRide', () => {
    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('deve retornar erro caso a corrida seja aceita por uma conta de não motorista', async () => {
      const passengerMocked = { ...getPassengerMock(), cpf: Math.random() };

      const { accountId } = await new AccountService().signup(passengerMocked, {
        shouldSkipCpfValidation: true,
      });

      const driverMocked = { ...getPassengerMock(), cpf: Math.random() };

      await new AccountService().signup(driverMocked, {
        shouldSkipCpfValidation: true,
      });

      let rideService = new RideService();

      const { ride_id } = await rideService.requestRide(accountId, {
        from: { lat: 2, long: 3 },
        to: { lat: 4, long: 5 },
      });

      const acceptRideResponse = await rideService.acceptRide(
        ride_id,
        accountId,
        accountId,
      );

      expect(acceptRideResponse).toHaveProperty(
        'errorMessage',
        'The account id must belong to a driver',
      );
    });

    it('deve retornar um erro caso o status da corrida seja diferente de requested', async () => {
      const passengerMocked = getPassengerMock();

      const { accountId } = await new AccountService().signup(passengerMocked, {
        shouldSkipCpfValidation: true,
      });

      const driverMocked = getDriverMock();

      const { accountId: driverId } = await new AccountService().signup(
        driverMocked,
        {
          shouldSkipCpfValidation: true,
        },
      );

      let rideService = new RideService();

      const { ride_id } = await rideService.requestRide(accountId, {
        from: { lat: 2, long: 3 },
        to: { lat: 4, long: 5 },
      });

      const acceptRideResponse = await rideService.acceptRide(
        ride_id,
        driverId,
        accountId,
      );

      console.log(acceptRideResponse, 'acceptRideResponse log');

      expect(acceptRideResponse).toHaveProperty(
        'errorMessage',
        'The ride status should be requested',
      );
    });

    it('deve retornar um erro caso já exista uma outra corrida com status accepted ou in progress para o motorista', async () => {
      const firstPassengerMocked = getPassengerMock();

      const { accountId: firstAccountId } = await new AccountService().signup(
        firstPassengerMocked,
        {
          shouldSkipCpfValidation: true,
        },
      );
      const secondPassengerMocked = getPassengerMock();
      const { accountId: secondAccountId } = await new AccountService().signup(
        secondPassengerMocked,
        {
          shouldSkipCpfValidation: true,
        },
      );
      const driverMocked = getDriverMock();
      const { accountId: driverId } = await new AccountService().signup(
        driverMocked,
        {
          shouldSkipCpfValidation: true,
        },
      );
      let rideService = new RideService();
      const { ride: firstRide } = await rideService.requestRide(
        firstAccountId,
        {
          from: { lat: 2, long: 3 },
          to: { lat: 4, long: 5 },
        },
      );
      const firstRideId = firstRide.ride_id;
      await rideService.acceptRide(firstRideId, driverId, firstAccountId);
      const { ride: secondRide } = await rideService.requestRide(
        secondAccountId,
        {
          from: { lat: 2, long: 3 },
          to: { lat: 4, long: 5 },
        },
      );
      const secondRideId = secondRide.ride_id;
      const acceptRideResponse = await rideService.acceptRide(
        secondRideId,
        driverId,
        secondAccountId,
      );
      expect(acceptRideResponse).toHaveProperty(
        'errorMessage',
        'You must finish your current ride before accepting a new one.',
      );
    });

    it.only('deve atualizar o status da corrida para accepted', async () => {
      const firstPassengerMocked = getPassengerMock();

      const { accountId: passengerId } = await new AccountService().signup(
        firstPassengerMocked,
        {
          shouldSkipCpfValidation: true,
        },
      );

      const driverMocked = getDriverMock();

      const { accountId: driverId } = await new AccountService().signup(
        driverMocked,
        {
          shouldSkipCpfValidation: true,
        },
      );

      let rideService = new RideService();

      const { ride } = await rideService.requestRide(passengerId, {
        from: { lat: 2, long: 3 },
        to: { lat: 4, long: 5 },
      });
      await rideService.acceptRide(ride.ride_id, driverId, passengerId);
      const updatedRide = await getRideById(ride.ride_id, passengerId);
      expect(updatedRide).toHaveProperty('status', RideStatus.ACCEPTED);
      expect(updatedRide).toHaveProperty('passenger_id', passengerId);
      expect(updatedRide).toHaveProperty('driver_id', driverId);
    });
  });
});
