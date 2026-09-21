import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { MediaType } from '@prisma/client';

export class CreateMediaAssetDto {
  @IsUrl({ protocols: ['https'], require_protocol: true })
  url!: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsEnum(MediaType)
  mediaType!: MediaType;
}