import { Module } from '@nestjs/common';
import { ProspectionService } from './prospection.service';
import { ProspectionController } from './prospection.controller';
import { S3ClientService } from '../../common/file-manager/s3-client.service';
import { CommonModule } from '../../common/common.module';

@Module({
  providers: [ProspectionService],
  controllers: [ProspectionController],
  imports: [CommonModule],
})
export class ProspectionModule {}
