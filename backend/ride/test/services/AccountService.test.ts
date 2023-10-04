import { getAccount } from '../../src/infra/repositories/account';
import AccountService from '../../src/services/AccountService';
import { passengerMock } from '../mocks/passengerMock';

test('Deve criar um passageiro', async function () {
  const accountService = new AccountService();
  const output = await accountService.signup(passengerMock, {
    shouldSkipCpfValidation: true,
  });
  const account = await getAccount(output.accountId);
  expect(account.account_id).toBeDefined();
  expect(account.name).toBe(passengerMock.name);
  expect(account.email).toBe(passengerMock.email);
  expect(account.cpf).toBe(output.cpf);
});

test('Não deve criar um passageiro com cpf inválido', async function () {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '95818705500',
    isPassenger: true,
  };
  const accountService = new AccountService();
  await expect(() => accountService.signup(input)).rejects.toThrow(
    new Error('Invalid cpf'),
  );
});

test('Não deve criar um passageiro com nome inválido', async function () {
  const input = {
    name: 'John',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: Math.random(),
    isPassenger: true,
  };
  const accountService = new AccountService();
  await expect(() => accountService.signup(input)).rejects.toThrow(
    new Error('Invalid name'),
  );
});

test('Não deve criar um passageiro com email inválido', async function () {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@`,
    cpf: Math.random(),
    isPassenger: true,
  };
  const accountService = new AccountService();
  await expect(() => accountService.signup(input)).rejects.toThrow(
    new Error('Invalid email'),
  );
});

test('Não deve criar um passageiro com conta existente', async function () {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: Math.random(),
    isPassenger: true,
  };
  const accountService = new AccountService();
  const { cpf } = await accountService.signup(input, {
    shouldSkipCpfValidation: true,
  });
  const inputWithCpfUpdated = { ...input, cpf };
  await expect(() =>
    accountService.signup(inputWithCpfUpdated, {
      shouldSkipCpfValidation: true,
    }),
  ).rejects.toThrow(new Error('Account already exists'));
});

test('Deve criar um motorista', async function () {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: Math.random(),
    carPlate: 'AAA9999',
    isDriver: true,
  };
  const accountService = new AccountService();
  const output = await accountService.signup(input, {
    shouldSkipCpfValidation: true,
  });
  expect(output.accountId).toBeDefined();
});

test('Não deve criar um motorista com placa do carro inválida', async function () {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: Math.random(),
    carPlate: 'AAA999',
    isDriver: true,
  };
  const accountService = new AccountService();
  await expect(() =>
    accountService.signup(input, { shouldSkipCpfValidation: true }),
  ).rejects.toThrow(new Error('Invalid plate'));
});
