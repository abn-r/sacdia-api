import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class FileUploadService {
  private supabase;

  constructor(private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
  }

  async uploadFile(file: Express.Multer.File, bucket: string, path: string) {
    const { data, error } = await this.supabase
      .storage
      .from(bucket)
      .upload(path, file.buffer);

    if (error) throw error;

    return data;
  }

  async uploadProfilePicture(file: Express.Multer.File, userId: string) {
    const path = `profile-pictures/${userId}/photo-${userId}`;
    const data = await this.uploadFile(file, 'avatars', path);

    await this.prisma.users.update({
      where: { user_id: userId },
      data: { user_image: data.path },
    });

    return data;
  }
}
