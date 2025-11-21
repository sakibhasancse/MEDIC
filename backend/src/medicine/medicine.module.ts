import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicineService } from './medicine.service';
import { MedicineController } from './medicine.controller';
import { Medicine, MedicineSchema } from '../schemas/medicine.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Medicine.name, schema: MedicineSchema }]),
  ],
  providers: [MedicineService],
  controllers: [MedicineController],
  exports: [MedicineService],
})
export class MedicineModule { }
