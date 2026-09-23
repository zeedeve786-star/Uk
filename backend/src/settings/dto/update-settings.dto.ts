import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() phoneDisplay?: string;
  @IsOptional() @IsString() phoneTel?: string;
  @IsOptional() @IsString() whatsappNumber?: string;
  @IsOptional() @IsEmail() contactEmail?: string;
  @IsOptional() @IsUrl() logoUrl?: string;
  @IsOptional() @IsString() tickerMessage?: string;
}