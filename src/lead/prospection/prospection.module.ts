import { Module } from '@nestjs/common';
import { ProspectionService } from './prospection.service';
import { ProspectionController } from './prospection.controller';
import { S3ClientService } from '../../common/file-uploader/s3-client.service';

@Module({
  providers: [ProspectionService, S3ClientService],
  controllers: [ProspectionController],
})
export class ProspectionModule {}
