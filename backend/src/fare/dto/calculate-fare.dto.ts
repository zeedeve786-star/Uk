import { IsEnum, IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export enum VehicleCategoryId {
  SALOON = 'saloon',
  ESTATE = 'estate',
  MPV = 'mpv',
  EXECUTIVE = 'executive',
  EIGHT_SEATER = 'eight-seater',
}

export class CalculateFareDto {
  @IsNumber()
  @IsPositive()
  distanceMiles!: number;

  @IsEnum(VehicleCategoryId)
  vehicleCategory!: VehicleCategoryId;

  @IsInt()
  @Min(0)
  extraStopCount!: number;
}