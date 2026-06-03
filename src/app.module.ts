import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProspectModule } from './prospect/prospect.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';

@Module({
  imports: [ProspectModule, { module: DatabaseModule, global: true }, UserModule, AuthModule, TenantModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
