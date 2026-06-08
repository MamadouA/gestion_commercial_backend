import { Module } from '@nestjs/common';
import { ProspectionService } from './prospection.service';
import { ProspectionController } from './prospection.controller';

@Module({
  providers: [ProspectionService],
  controllers: [ProspectionController]
})
export class ProspectionModule {}
