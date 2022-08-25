import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MedicalSupplyService } from './medical-supply.service';
import { MedicalSupplyController } from './medical-supply.controller';
import { MedicalSupply } from './entities/medical-supply.entity';
import { CommonModule } from '../common/common.module';
import { LotModule } from './lot/lot.module';

@Module({
  controllers: [MedicalSupplyController],
  providers: [MedicalSupplyService],
  imports: [
    TypeOrmModule.forFeature([MedicalSupply]),
    CommonModule,
  ],
  exports: [MedicalSupplyService],
})
export class MedicalSupplyModule {}
