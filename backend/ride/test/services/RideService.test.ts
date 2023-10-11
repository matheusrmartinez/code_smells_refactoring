import { RideStatus } from '../../src/enums/RideStatus';
import { getRideById } from '../../src/infra/repositories/ride';
import { Ride } from '../../src/interfaces/Ride';
import AccountService from '../../src/services/AccountService';
import RideService from '../../src/services/RideService';
import { driverMock } from '../mocks/driverMock';
import { passengerMock } from '../mocks/passengerMock';

describe('Ride Service', () => {
  describe('requestRide', () => {
    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('deve retornar um erro caso o passageiro já possua uma corrida em andamento', async () => {
      const passengerMocked = { ...passengerMock, cpf: Math.random() };

      const { accountId } = await new AccountService().signup(passengerMocked, {
        shouldSkipCpfValidation: true,
      });

      let rideService = new RideService();

      await rideService.requestRide(accountId, {
        from: { lat: 2, long: 3 },
        to: { lat: 4, long: 5 },
      });

      await expect(() =>
        rideService.requestRide(accountId, {
          from: { lat: 2, long: 3 },
          to: { lat: 4, long: 5 },
        }),
      ).rejects.toThrow(new Error('Another ride is on going'));

      rideService = null;
    });
    it('deve retornar erro caso a corrida seja solicitada por uma conta de não passageiro', async () => {
      const driverMocked = { ...driverMock, cpf: Math.random() };

      const { accountId } = await new AccountService().signup(driverMocked, {
        shouldSkipCpfValidation: true,
      });

      let rideService = new RideService();

      await expect(() =>
        rideService.requestRide(accountId, {
          from: { lat: 2, long: 3 },
          to: { lat: 4, long: 5 },
        }),
      ).rejects.toThrow(new Error('The account id must belong to a passenger'));

      rideService = null;
    });
    it('deve retornar uma corrida caso seja um passageiro e não tenha corrida em andamento', async () => {
      const passengerMocked = { ...passengerMock, cpf: Math.random() };

      const { accountId } = await new AccountService().signup(passengerMocked, {
        shouldSkipCpfValidation: true,
      });

      const rideService = new RideService();

      const rideResponse = await rideService.requestRide(accountId, {
        from: { lat: 2, long: 3 },
        to: { lat: 4, long: 5 },
      });

      await expect(rideResponse).toHaveProperty('passenger_id', accountId);
    });
  });

  describe('acceptRide', () => {
    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('deve retornar erro caso a corrida seja aceita por uma conta de não motorista', async () => {
      const passengerMocked = { ...passengerMock, cpf: Math.random() };

      const { accountId } = await new AccountService().signup(passengerMocked, {
        shouldSkipCpfValidation: true,
      });

      const driverMocked = { ...passengerMock, cpf: Math.random() };

      await new AccountService().signup(driverMocked, {
        shouldSkipCpfValidation: true,
      });

      let rideService = new RideService();

      const { ride_id } = await rideService.requestRide(accountId, {
        from: { lat: 2, long: 3 },
        to: { lat: 4, long: 5 },
      });

      await expect(() =>
        rideService.acceptRide(ride_id, accountId, accountId),
      ).rejects.toThrow(new Error('The account id must belong to a driver'));
    });

    it('deve retornar um erro caso o status da corrida seja diferente de requested', async () => {
      const passengerMocked = { ...passengerMock, cpf: Math.random() };

      const { accountId } = await new AccountService().signup(passengerMocked, {
        shouldSkipCpfValidation: true,
      });

      const driverMocked = { ...driverMock, cpf: Math.random() };

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

      await rideService.acceptRide(ride_id, driverId, accountId);

      await expect(() =>
        rideService.acceptRide(ride_id, driverId, accountId),
      ).rejects.toThrow(new Error('The ride status should be requested'));
    });

    it('deve retornar um erro caso já exista uma outra corrida com status accepted ou in progress para o motorista', async () => {
      const firstPassengerMocked = { ...passengerMock, cpf: Math.random() };

      const { accountId: firstAccountId } = await new AccountService().signup(
        firstPassengerMocked,
        {
          shouldSkipCpfValidation: true,
        },
      );

      const secondPassengerMocked = { ...passengerMock, cpf: Math.random() };

      const { accountId: secondAccountId } = await new AccountService().signup(
        secondPassengerMocked,
        {
          shouldSkipCpfValidation: true,
        },
      );

      const driverMocked = { ...driverMock, cpf: Math.random() };

      const { accountId: driverId } = await new AccountService().signup(
        driverMocked,
        {
          shouldSkipCpfValidation: true,
        },
      );

      let rideService = new RideService();

      const { ride_id: firstRideId } = await rideService.requestRide(
        firstAccountId,
        {
          from: { lat: 2, long: 3 },
          to: { lat: 4, long: 5 },
        },
      );

      await rideService.acceptRide(firstRideId, driverId, firstAccountId);

      const { ride_id: secondRideId } = await rideService.requestRide(
        secondAccountId,
        {
          from: { lat: 2, long: 3 },
          to: { lat: 4, long: 5 },
        },
      );

      await expect(() =>
        rideService.acceptRide(secondRideId, driverId, secondAccountId),
      ).rejects.toThrow(
        new Error(
          'You must finish your current ride before accepting a new one.',
        ),
      );
    });

    it('deve atualizar o status da corrida para accepted', async () => {
      const firstPassengerMocked = { ...passengerMock, cpf: Math.random() };

      const { accountId: passengerId } = await new AccountService().signup(
        firstPassengerMocked,
        {
          shouldSkipCpfValidation: true,
        },
      );

      const driverMocked = { ...driverMock, cpf: Math.random() };

      const { accountId: driverId } = await new AccountService().signup(
        driverMocked,
        {
          shouldSkipCpfValidation: true,
        },
      );

      let rideService = new RideService();

      const { ride_id } = await rideService.requestRide(passengerId, {
        from: { lat: 2, long: 3 },
        to: { lat: 4, long: 5 },
      });

      await rideService.acceptRide(ride_id, driverId, passengerId);

      const updatedRide = await getRideById(ride_id, passengerId);

      expect(updatedRide).toHaveProperty('status', RideStatus.ACCEPTED);
      expect(updatedRide).toHaveProperty('passenger_id', passengerId);
      expect(updatedRide).toHaveProperty('driver_id', driverId);
    });
  });
});
