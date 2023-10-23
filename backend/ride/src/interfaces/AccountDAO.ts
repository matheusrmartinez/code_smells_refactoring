// port
export default interface AccountDAO {
  save(account: any): Promise<void>;
  getByCpf(email: string): Promise<any>;
  getById(accountId: string): Promise<any>;
}
