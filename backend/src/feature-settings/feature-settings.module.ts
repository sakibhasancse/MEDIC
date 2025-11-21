import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeatureSettingsService } from './feature-settings.service';
import { FeatureSettingsController } from './feature-settings.controller';
import { FeatureSettings, FeatureSettingsSchema } from '../schemas/feature-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FeatureSettings.name, schema: FeatureSettingsSchema }]),
  ],
  providers: [FeatureSettingsService],
  controllers: [FeatureSettingsController],
  exports: [FeatureSettingsService],
})
export class FeatureSettingsModule { }
