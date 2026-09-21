import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateServiceContentDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() eventType?: string;
  @IsOptional() @IsArray() @IsUrl({}, { each: true }) imageUrls?: string[];
  @IsOptional() @IsArray() @IsUrl({}, { each: true }) videoUrls?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) relatedBlogSlugs?: string[];
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
}