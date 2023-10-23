import crypto from 'crypto';

export const getPassengerMock = () => ({
  name: 'John Doe',
  email: `john.doe${Math.random()}@gmail.com`,
  cpf: Math.random().toString(),
  isPassenger: true,
  verificationCode: crypto.randomUUID(),
});
