import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [{ module: DatabaseModule, global: true }, UserModule, AuthModule, TenantModule, ClientModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
