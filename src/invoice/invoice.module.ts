import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService],
  imports: [CommonModule],
})
export class InvoiceModule {}
