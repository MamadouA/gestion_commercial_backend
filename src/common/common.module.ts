import { Module } from '@nestjs/common';
import { S3ClientService } from './file-manager/s3-client.service';

@Module({
  controllers: [],
  providers: [S3ClientService],
  exports: [S3ClientService],
})
export class CommonModule {}
