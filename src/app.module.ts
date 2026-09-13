import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { ClientModule } from './client/client.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { CommonModule } from './common/common.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProjectModule } from './project/project.module';
import { RoleManagementModule } from './role/role.module';
import { ScheduleModule } from '@nestjs/schedule';
import { InvoiceModule } from './invoice/invoice.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { CommentModule } from './comment/comment.module';
import { DocumentModule } from './document/document.module';
import { ReportModule } from './report/report.module';
import { NotificationModule } from './notification/notification.module';
import { LeadModule } from './lead/lead.module';

@Module({
  imports: [
    { module: DatabaseModule, global: true },
    UserModule,
    AuthModule,
    TenantModule,
    ClientModule,
    CommonModule,
    DashboardModule,
    ProjectModule,
    RoleManagementModule,
    ScheduleModule.forRoot(),
    InvoiceModule,
    SubscriptionModule,
    CommentModule,
    DocumentModule,
    ReportModule,
    NotificationModule,
    LeadModule,
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
