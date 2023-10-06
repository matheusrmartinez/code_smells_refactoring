import AccountService from '../../src/services/AccountService';
import RideService from '../../src/services/RideService';
import { driverMock } from '../mocks/driverMock';
import { passengerMock } from '../mocks/passengerMock';

describe('Ride Service', () => {
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
    const { accountId } = await new AccountService().signup(driverMock, {
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
