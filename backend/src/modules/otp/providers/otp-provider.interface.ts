export interface IOtpProvider {
  send(recipient: string, code: string): Promise<void>;
}
