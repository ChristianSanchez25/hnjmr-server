import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MedicalSupplyModule } from './medical-supply/medical-supply.module';
import { NationalAssetModule } from './national-asset/national-asset.module';
import { PatientModule } from './patient/patient.module';
import { CommonModule } from './common/common.module';
import { LotModule } from './medical-supply/lot/lot.module';
import { DepartmentModule } from './department/department.module';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AssetModule } from './asset/asset.module';






@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod',
      extra: {
        ssl: process.env.STAGE === 'prod'?
             {rejectUnauthorized: false} 
             : null,
      },
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: process.env.STAGE === 'dev',
    }),
    MedicalSupplyModule,
    LotModule,
    NationalAssetModule,
    PatientModule,
    CommonModule,
    DepartmentModule,
    SeedModule,
    AuthModule,
    UserModule,
    AssetModule,],
  controllers: [],
  providers: [],
})
export class AppModule {}
