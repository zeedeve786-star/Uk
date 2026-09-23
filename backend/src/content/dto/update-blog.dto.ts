import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateBlogDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsUrl() featuredImageUrl?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
}