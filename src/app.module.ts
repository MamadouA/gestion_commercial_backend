import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { ClientModule } from './client/client.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { ProspectionModule } from './lead/prospection/prospection.module';
import { ProductModule } from './lead/product/product.module';
import { OfferModule } from './lead/offer/offer.module';
import { CommonModule } from './common/common.module';
import { MissionModule } from './mission/mission.module';

@Module({
  imports: [
    { module: DatabaseModule, global: true },
    UserModule,
    AuthModule,
    TenantModule,
    ClientModule,
    ProspectionModule,
    ProductModule,
    OfferModule,
    CommonModule,
    MissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude('/auth/login', '/tenant/create')
      .forRoutes('*');
  }
}
