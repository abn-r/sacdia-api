import { Controller, Post, UseInterceptors, UploadedFile, Param, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { FileUploadService } from './file_upload.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('fu')
@UseGuards(JwtAuthGuard)
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