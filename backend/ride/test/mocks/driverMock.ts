export const getDriverMock = () => ({
  name: 'John Doe',
  email: `john.doe${Math.random()}@gmail.com`,
  cpf: Math.random().toString(),
  isPassenger: false,
  isDriver: true,
  carPlate: 'KCT3379',
});
