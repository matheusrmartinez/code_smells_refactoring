import sinon from 'sinon';
import AccountService from '../../src/services/AccountService';
import { getDriverMock } from '../mocks/driverMock';
import { getPassengerMock } from '../mocks/passengerMock';
import AccountDAO from '../../src/infra/repository/AccountDAODatabase';
import AccountDAOMemory from '../../src/infra/repository/AccountDAOMemory';
import MailerGateway from '../../src/infra/MailerGateway';

test('Deve criar um passageiro', async function () {
  const accountService = new AccountService();
  const passenger = getPassengerMock();
  const output = await accountService.signup(passenger, {
    shouldSkipCpfValidation: true,
  });
  const account = await accountService.getAccount(output.accountId);
  expect(account.name).toBe(passenger.name);
  expect(account.email).toBe(passenger.email);
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
  const signUpResponse = await accountService.signup(input);
  await expect(signUpResponse).toHaveProperty('errorMessage', 'Invalid cpf');
});

test('Não deve criar um passageiro com nome inválido', async function () {
  const input = {
    name: 'John',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: Math.random(),
    isPassenger: true,
  };
  const accountService = new AccountService();
  const signUpResponse = await accountService.signup(input);
  await expect(signUpResponse).toHaveProperty('errorMessage', 'Invalid name');
});

test('Não deve criar um passageiro com email inválido', async function () {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@`,
    cpf: Math.random(),
    isPassenger: true,
  };
  const accountService = new AccountService();
  const signUpResponse = await accountService.signup(input);
  await expect(signUpResponse).toHaveProperty('errorMessage', 'Invalid email');
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
  const signUpResponse = await accountService.signup(inputWithCpfUpdated);
  await expect(signUpResponse).toHaveProperty(
    'errorMessage',
    'Account already exists',
  );
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
  const accountService = new AccountService();

  const driverWithWrongPlate = { ...getDriverMock(), carPlate: 'AAA-9999' };

  const signUpResponse = await accountService.signup(driverWithWrongPlate, {
    shouldSkipCpfValidation: true,
  });
  await expect(signUpResponse).toHaveProperty('errorMessage', 'Invalid plate');
});

test('Deve criar um passageiro com stub', async function () {
  const input: any = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '95818705552',
    isPassenger: true,
  };
  const stubSave = sinon.stub(AccountDAO.prototype, 'save').resolves();
  const stubGetByEmail = sinon
    .stub(AccountDAO.prototype, 'getByCpf')
    .resolves();
  const accountService = new AccountService();
  const output = await accountService.signup(input);
  input.account_id = output.accountId;
  const stubGetById = sinon
    .stub(AccountDAO.prototype, 'getById')
    .resolves(input);
  const account = await accountService.getAccount(output.accountId);
  expect(account.account_id).toBeDefined();
  expect(account.name).toBe(input.name);
  expect(account.email).toBe(input.email);
  expect(account.cpf).toBe(input.cpf);
  stubSave.restore();
  stubGetByEmail.restore();
  stubGetById.restore();
});

test('Deve criar um passageiro com spy', async function () {
  const spy = sinon.spy(MailerGateway.prototype, 'send');
  const input: any = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '95818705552',
    isPassenger: true,
  };
  const stubSave = sinon.stub(AccountDAO.prototype, 'save').resolves();
  const stubGetByEmail = sinon
    .stub(AccountDAO.prototype, 'getByCpf')
    .resolves();
  const accountService = new AccountService();
  const output = await accountService.signup(input);
  input.account_id = output.accountId;
  const stubGetById = sinon
    .stub(AccountDAO.prototype, 'getById')
    .resolves(input);
  const account = await accountService.getAccount(output.accountId);
  expect(spy.calledOnce).toBeTruthy();
  expect(spy.calledWith(input.email, 'Verification')).toBeTruthy();
  spy.restore();
  stubSave.restore();
  stubGetByEmail.restore();
  stubGetById.restore();
});

test('Deve criar um passageiro com mock', async function () {
  const input: any = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '95818705552',
    isPassenger: true,
  };
  const mock = sinon.mock(MailerGateway.prototype);
  mock.expects('send').withArgs(input.email, 'Verification').calledOnce;
  const mockAccountDAO = sinon.mock(AccountDAO.prototype);
  mockAccountDAO.expects('save').resolves();
  mockAccountDAO.expects('getByCpf').resolves();
  const accountService = new AccountService();
  const output = await accountService.signup(input);
  input.account_id = output.accountId;
  mockAccountDAO.expects('getById').resolves(input);
  const account = await accountService.getAccount(output.accountId);
  mock.verify();
  mock.restore();
});

test('Deve criar um passageiro com fake', async function () {
  const accountDAO = new AccountDAOMemory();
  const input: any = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '95818705552',
    isPassenger: true,
  };
  const accountService = new AccountService(accountDAO);
  const output = await accountService.signup(input);
  const account = await accountService.getAccount(output.accountId);
  expect(account.account_id).toBeDefined();
  expect(account.name).toBe(input.name);
  expect(account.email).toBe(input.email);
  expect(account.cpf).toBe(input.cpf);
});
