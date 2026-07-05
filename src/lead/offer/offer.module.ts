import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { CommonModule } from '../../common/common.module';

@Module({
  providers: [OfferService],
  controllers: [OfferController],
  imports: [CommonModule],
})
export class OfferModule {}
