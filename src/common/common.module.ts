import { Module } from '@nestjs/common';
import { S3ClientService } from './file-manager/s3-client.service';
import { FileManagerController } from './file-manager/file-manager.controller';

@Module({
  controllers: [FileManagerController],
  providers: [S3ClientService],
  exports: [S3ClientService],
})
export class CommonModule {}
