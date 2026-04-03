import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

/**
 * Cấu hình kết nối MongoDB dùng chung cho ứng dụng.
 */
export const getDatabaseConfig = (
	configService: ConfigService,
): MongooseModuleOptions => ({
	uri: configService.get<string>('MONGODB_URI'),
});
