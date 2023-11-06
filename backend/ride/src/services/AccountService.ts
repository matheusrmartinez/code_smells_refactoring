import crypto from 'crypto';
import CpfValidator from '../utils/CpfValidator';
import ClientDB from '../utils/client_db';
import AccountDAODatabase from '../infra/repository/AccountDAODatabase';
import AccountDAO from '../interfaces/DAO/AccountDAO';
import MailerGateway from '../infra/MailerGateway';

export default class AccountService {
  cpfValidator: CpfValidator;
  mailerGateway: MailerGateway;

  constructor(readonly accountDAO: AccountDAO = new AccountDAODatabase()) {
    this.cpfValidator = new CpfValidator();
    this.mailerGateway = new MailerGateway();
  }

  // port
  async signup(input: any, { shouldSkipCpfValidation = false } = {}) {
    let errorMessage = null;
    let client = null;

    try {
      client = await new ClientDB().getClient();
      await client.connect();
      input.accountId = crypto.randomUUID();
      input.verificationCode = crypto.randomUUID();
      input.date = new Date();
      const existingAccount = await this.accountDAO.getByCpf(input.cpf);
      if (existingAccount) throw new Error('Account already exists');
      if (!input.name.match(/[a-zA-Z] [a-zA-Z]+/))
        throw new Error('Invalid name');
      if (!input.email.match(/^(.+)@(.+)$/)) throw new Error('Invalid email');
      if (!shouldSkipCpfValidation) {
        if (!this.cpfValidator.validate(input.cpf))
          throw new Error('Invalid cpf');
      }
      if (input.isDriver && !input.carPlate.match(/[A-Z]{3}[0-9]{4}/))
        throw new Error('Invalid plate');
      await this.accountDAO.save(input);
      await this.mailerGateway.send(
        input.email,
        'Verification',
        `Please verify your code at first login ${input.verificationCode}`,
      );
    } catch (error) {
      errorMessage = error.message;
      throw new Error(
        `Falha ao realizar o processo de signup: ${error.message}`,
      );
    } finally {
      await client.end();
      return { errorMessage, accountId: input.accountId, cpf: input.cpf };
    }
  }

  // port
  async getAccount(accountId: string) {
    const account = await this.accountDAO.getById(accountId);
    return account;
  }
}
