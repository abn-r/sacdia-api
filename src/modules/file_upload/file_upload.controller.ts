import { Controller, Post, UseInterceptors, UploadedFile, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { FileUploadService } from './file_upload.service';
import { SupabaseGuard } from '../../common/guards/supabase.guard';

@Controller('fu')
@ApiTags('File Upload')
@UseGuards(SupabaseGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('pp/:userId') // pp = profile picture
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: string
  ) {
    return this.fileUploadService.uploadProfilePicture(file, userId);
  }
}