import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MedicineModule } from './medicine/medicine.module';
import { PatientModule } from './patient/patient.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { TemplateModule } from './template/template.module';
import { SettingsModule } from './settings/settings.module';
import { HospitalModule } from './hospital/hospital.module';
import { FeatureSettingsModule } from './feature-settings/feature-settings.module';
import { StatsModule } from './stats/stats.module';
import { PrintTemplateModule } from './print-template/print-template.module';
import { GlobalHospitalModule } from './global-hospital/global-hospital.module';

import { DoctorProfileModule } from './doctor-profile/doctor-profile.module';

import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/prescription-maker'
    ),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    MedicineModule,
    PatientModule,
    PrescriptionModule,
    TemplateModule,
    SettingsModule,
    HospitalModule,
    FeatureSettingsModule,
    FeatureSettingsModule,
    StatsModule,
    PrintTemplateModule,
    GlobalHospitalModule,
    DoctorProfileModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
