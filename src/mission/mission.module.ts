import { Module } from '@nestjs/common';
import { MissionService } from './mission.service';
import { MissionController } from './mission.controller';

@Module({
  providers: [MissionService],
  controllers: [MissionController]
})
export class MissionModule {}
