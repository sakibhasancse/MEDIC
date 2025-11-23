import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalHospital, GlobalHospitalSchema } from '../schemas/global-hospital.schema';
import { GlobalHospitalController } from './global-hospital.controller';
import { GlobalHospitalService } from './global-hospital.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GlobalHospital.name, schema: GlobalHospitalSchema },
    ]),
  ],
  controllers: [GlobalHospitalController],
  providers: [GlobalHospitalService],
  exports: [GlobalHospitalService],
})
export class GlobalHospitalModule { }
