import crypto from 'crypto';
import AccountDAO from '../../../src/infra/DAO/AccountDAO';
import { getPassengerMock } from '../../mocks/passengerMock';

test('Deve criar um registro na tabela account e consultar por cpf', async function () {
  const accountDAO = new AccountDAO();

  const account = {
    accountId: crypto.randomUUID(),
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: Math.random().toString(),
    isPassenger: true,
    date: new Date(),
    verificationCode: crypto.randomUUID(),
  };
  await accountDAO.save(account);
  const savedAccount = await accountDAO.getByCpf(account.cpf);
  expect(savedAccount.account_id).toBeDefined();
  expect(savedAccount.name).toBe(account.name);
  expect(savedAccount.email).toBe(account.email);
  expect(savedAccount.cpf).toBe(account.cpf);
  expect(savedAccount.is_passenger).toBeTruthy();
  expect(savedAccount.date).toBeDefined();
  expect(savedAccount.verification_code).toBe(account.verificationCode);
});

test('Deve criar um registro na tabela account e consultar por account_id', async function () {
  const accountDAO = new AccountDAO();
  const account = {
    accountId: crypto.randomUUID(),
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: Math.random().toString(),
    isPassenger: true,
    date: new Date(),
    verificationCode: crypto.randomUUID(),
  };
  await accountDAO.save(account);
  const savedAccount = await accountDAO.getById(account.accountId);
  expect(savedAccount.account_id).toBeDefined();
  expect(savedAccount.name).toBe(account.name);
  expect(savedAccount.email).toBe(account.email);
  expect(savedAccount.cpf).toBe(account.cpf);
  expect(savedAccount.is_passenger).toBeTruthy();
  expect(savedAccount.date).toBeDefined();
  expect(savedAccount.verification_code).toBe(account.verificationCode);
});
