import { Module } from '@nestjs/common';
import { ProspectService } from './prospect.service';
import { ProspectController } from './prospect.controller';

@Module({
  controllers: [ProspectController],
  providers: [ProspectService],
})
export class ProspectModule {}
