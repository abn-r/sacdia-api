import { Module } from '@nestjs/common';
import { FileUploadController } from './file_upload.controller';
import { FileUploadService } from './file_upload.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
