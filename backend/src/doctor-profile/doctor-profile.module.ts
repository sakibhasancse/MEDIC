import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorProfileController } from './doctor-profile.controller';
import { DoctorProfileService } from './doctor-profile.service';
import { DoctorProfile, DoctorProfileSchema } from '../schemas/doctor-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DoctorProfile.name, schema: DoctorProfileSchema }]),
  ],
  controllers: [DoctorProfileController],
  providers: [DoctorProfileService],
  exports: [DoctorProfileService],
})
export class DoctorProfileModule { }
