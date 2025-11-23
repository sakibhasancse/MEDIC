import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalHospital, GlobalHospitalDocument } from '../schemas/global-hospital.schema';
import * as fs from 'fs';
import * as path from 'path';
const csv = require('csv-parser');

@Injectable()
export class GlobalHospitalService {
  private readonly logger = new Logger(GlobalHospitalService.name);

  constructor(
    @InjectModel(GlobalHospital.name)
    private globalHospitalModel: Model<GlobalHospitalDocument>,
  ) { }

  async importFromCsv(filePath: string): Promise<{ count: number }> {
    const results: any[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            this.logger.log(`Parsed ${results.length} rows from CSV`);
            let count = 0;

            // Process in chunks to avoid memory issues
            const chunkSize = 100;
            for (let i = 0; i < results.length; i += chunkSize) {
              const chunk = results.slice(i, i + chunkSize);
              const operations = chunk.map(row => {
                return {
                  updateOne: {
                    filter: { id: parseInt(row.Id) },
                    update: {
                      $set: {
                        name: row.Name,
                        nameBangla: row['Name (Bangla)'],
                        code: row.Code,
                        agency: row.Agency,
                        type: row.Type,
                        division: row.Division,
                        district: row.District,
                        cityCorporation: row['City Corporation'],
                        upazila: row.Upazila,
                        paurasava: row.Paurasava,
                        union: row.Union,
                        private: row.Private === '1',
                      }
                    },
                    upsert: true
                  }
                };
              });

              await this.globalHospitalModel.bulkWrite(operations);
              count += chunk.length;
              this.logger.log(`Processed ${count}/${results.length} records`);
            }

            resolve({ count });
          } catch (error) {
            this.logger.error('Error importing CSV', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          this.logger.error('Error reading CSV file', error);
          reject(error);
        });
    });
  }

  async search(query: string, limit: number = 20): Promise<GlobalHospital[]> {
    if (!query) return [];

    return this.globalHospitalModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { nameBangla: { $regex: query, $options: 'i' } }
      ]
    })
      .limit(limit)
      .exec();
  }
}
