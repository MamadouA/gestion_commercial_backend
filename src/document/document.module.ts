import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { CommonModule } from '../common/common.module';

@Module({
  providers: [DocumentService],
  controllers: [DocumentController],
  imports: [CommonModule],
})
export class DocumentModule {}
