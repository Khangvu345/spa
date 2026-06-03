import * as dns from 'dns';

/**
 * Cấu hình DNS dùng chung cho app runtime và script CLI.
 *
 * MongoDB Atlas dùng SRV record (`mongodb+srv://`). Một số môi trường Windows/ISP
 * resolve SRV qua DNS mặc định không ổn định, nên ép IPv4 và DNS resolver rõ ràng.
 */
export function configureDns(): void {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}
