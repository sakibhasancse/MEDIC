import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { DoctorSettings, DoctorSettingsSchema } from '../schemas/doctor-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DoctorSettings.name, schema: DoctorSettingsSchema }]),
  ],
  providers: [SettingsService],
  controllers: [SettingsController],
  exports: [SettingsService],
})
export class SettingsModule { }
