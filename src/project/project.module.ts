import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { CommonModule } from '../common/common.module';

@Module({
  providers: [ProjectService],
  controllers: [ProjectController],
  imports: [CommonModule]
})
export class ProjectModule {}
