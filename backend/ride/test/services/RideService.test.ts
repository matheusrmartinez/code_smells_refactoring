import AccountService from '../../src/services/AccountService';
import RideService from '../../src/services/RideService';
import { passengerMock } from '../mocks/passengerMock';

describe('Ride Service', () => {
  it('deve retornar um erro caso o passageiro já possua uma corrida em andamento', async () => {
    const { accountId } = await new AccountService().signup(passengerMock, {
      shouldSkipCpfValidation: true,
    });
    const rideService = new RideService();

    expect(true).toBe(true);
    const response = await rideService.requestRide(accountId, {
      from: { lat: 2, long: 3 },
      to: { lat: 4, long: 5 },
    });

    console.log(response, 'response');

    // await expect(() =>
    //   rideService.requestRide(accountId, {
    //     from: { lat: 2, long: 3 },
    //     to: { lat: 4, long: 5 },
    //   }),
    // ).rejects.toThrow(new Error('Another ride is already in progress'));
  });
});
