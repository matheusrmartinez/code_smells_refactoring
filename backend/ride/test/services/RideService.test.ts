import { RideStatus } from '../../src/enums/RideStatus';
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

      console.log({ accountId }, 'account id');

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

      console.log(driverId, 'driverId');

      let rideService = new RideService();

      const { ride_id } = await rideService.requestRide(accountId, {
        from: { lat: 2, long: 3 },
        to: { lat: 4, long: 5 },
      });

      await expect(() =>
        rideService.acceptRide(ride_id, driverId, accountId),
      ).rejects.toThrow(new Error('The ride status should be requested'));
    });

    // it('deve atualizar o status da corrida para accepted', async () => {
    //   const passengerMocked = { ...passengerMock, cpf: Math.random() };

    //   const { accountId } = await new AccountService().signup(passengerMocked, {
    //     shouldSkipCpfValidation: true,
    //   });

    //   const rideService = new RideService();

    //   const rideResponse = await rideService.requestRide(accountId, {
    //     from: { lat: 2, long: 3 },
    //     to: { lat: 4, long: 5 },
    //   });

    //   await expect(rideResponse).toHaveProperty('passenger_id', accountId);
    // });
  });
});
