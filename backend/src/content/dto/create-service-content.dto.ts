import { IsArray, IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { ContentStatus, ServiceContentType } from '@prisma/client';

export class CreateServiceContentDto {
  @IsEnum(ServiceContentType)
  type!: ServiceContentType;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @IsString()
  @MinLength(1)
  description!: string;

  // Meaningful only when type = EVENT; accepted regardless to keep the DTO
  // simple, per the "keep the implementation simple" instruction.
  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  videoUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedBlogSlugs?: string[];

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;
}