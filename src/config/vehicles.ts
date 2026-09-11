import type { VehicleCategory } from '../models/vehicle';

export const vehicleCatalog: VehicleCategory[] = [
  {
    id: 'saloon',
    name: 'Saloon Car',
    description: 'Comfortable four-door car suited to individual and small journeys.',
    passengerCapacity: 3,
    luggageCapacity: 2,
    imagePlaceholder: 'Saloon car placeholder image',
  },
  {
    id: 'estate',
    name: 'Estate Car',
    description: 'Extra luggage space, ideal for airport runs with additional bags.',
    passengerCapacity: 3,
    luggageCapacity: 4,
    imagePlaceholder: 'Estate car placeholder image',
  },
  {
    id: 'mpv',
    name: 'MPV Car',
    description: 'Spacious people-carrier for small groups travelling together.',
    passengerCapacity: 5,
    luggageCapacity: 4,
    imagePlaceholder: 'MPV placeholder image',
  },
  {
    id: 'executive',
    name: 'Executive Car',
    description: 'Premium vehicle for business travel and special occasions.',
    passengerCapacity: 3,
    luggageCapacity: 3,
    imagePlaceholder: 'Executive car placeholder image',
  },
  {
    id: 'eight-seater',
    name: '8-Seater Car',
    description: 'Larger vehicle for groups and events transport.',
    passengerCapacity: 8,
    luggageCapacity: 6,
    imagePlaceholder: '8-seater placeholder image',
  },
];
