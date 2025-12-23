import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    NestCacheModule.register({
      ttl: 300000, // 5 minutos
      max: 1000, // máximo 1000 items en caché
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {} 