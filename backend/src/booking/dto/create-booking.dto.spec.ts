import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateBookingDto } from './create-booking.dto';
import { VehicleCategoryId } from '../../fare/dto/calculate-fare.dto';

describe('CreateBookingDto validation', () => {
  const validPayload = {
    pickup: 'Manchester Airport',
    destination: 'Manchester City Centre',
    journeyDate: '2026-01-01',
    journeyTime: '14:30',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    customerPhone: '+44 7000 000000',
    passengerCount: 2,
    vehicleCategory: VehicleCategoryId.SALOON,
    distanceMiles: 12,
  };

  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreateBookingDto, validPayload);

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects passenger count below 1', async () => {
    const dto = plainToInstance(CreateBookingDto, {
      ...validPayload,
      passengerCount: 0,
    });

    expect((await validate(dto)).length).toBeGreaterThan(0);
  });

  it('rejects an unsupported vehicle category', async () => {
    const dto = plainToInstance(CreateBookingDto, {
      ...validPayload,
      vehicleCategory: 'limousine',
    });

    expect((await validate(dto)).length).toBeGreaterThan(0);
  });

  it('rejects an invalid email address', async () => {
    const dto = plainToInstance(CreateBookingDto, {
      ...validPayload,
      customerEmail: 'not-an-email',
    });

    expect((await validate(dto)).length).toBeGreaterThan(0);
  });

  it('rejects an invalid journey time', async () => {
    const dto = plainToInstance(CreateBookingDto, {
      ...validPayload,
      journeyTime: '25:90',
    });

    expect((await validate(dto)).length).toBeGreaterThan(0);
  });

  it('rejects an invalid journey date', async () => {
    const dto = plainToInstance(CreateBookingDto, {
      ...validPayload,
      journeyDate: 'not-a-date',
    });

    expect((await validate(dto)).length).toBeGreaterThan(0);
  });
});