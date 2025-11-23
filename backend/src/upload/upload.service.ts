import { Injectable, OnModuleInit } from '@nestjs/common';
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService implements OnModuleInit {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get('AWS_BUCKET_NAME') || 'prescription-maker';

    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION') || 'us-east-1',
      endpoint: this.configService.get('AWS_ENDPOINT') || 'http://localhost:9000',
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || 'minioadmin',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || 'minioadmin',
      },
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
    } catch (error) {
      try {
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
        console.log(`Bucket ${this.bucketName} created successfully`);
      } catch (createError) {
        console.error('Error creating bucket:', createError);
      }
    }

    // Always set public policy to ensure access
    try {
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };

      await this.s3Client.send(new PutBucketPolicyCommand({
        Bucket: this.bucketName,
        Policy: JSON.stringify(policy),
      }));
      console.log(`Bucket policy set to public for ${this.bucketName}`);
    } catch (policyError) {
      console.error('Error setting bucket policy:', policyError);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          // ACL: 'public-read', // Deprecated/Not supported in some MinIO configs, relying on bucket policy instead
        }),
      );

      // Return the URL
      const endpoint = this.configService.get('AWS_ENDPOINT') || 'http://localhost:9000';
      return `${endpoint}/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}