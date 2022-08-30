import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NationalAssetService } from './national-asset.service';
import { NationalAssetController } from './national-asset.controller';
import { NationalAsset } from './entities/national-asset.entity';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [NationalAssetController],
  providers: [NationalAssetService], 
  imports : [
    TypeOrmModule.forFeature([NationalAsset]),
    CommonModule,
  ],
  exports: [NationalAssetService, TypeOrmModule],
})
export class NationalAssetModule {}
