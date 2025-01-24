export abstract class HashingServiceProtocol {
  abstract hash(password: string): Promise<string>;
}
