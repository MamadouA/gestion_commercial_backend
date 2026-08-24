import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { CommonModule } from '../common/common.module';

@Module({
  providers: [ReportService],
  controllers: [ReportController],
  imports: [CommonModule],
})
export class ReportModule {}
