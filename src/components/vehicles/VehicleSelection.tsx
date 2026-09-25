import { useEffect, useState } from 'react';
import type { JourneyDetails } from '../../models/booking';
import type { VehicleCategoryId, VehicleOption } from '../../models/vehicle';
import { vehicleCatalog } from '../../config/vehicles';
import { getFareEstimate } from '../../services/fareService';
import { VehicleCard } from './VehicleCard';
import styles from './VehicleSelection.module.css';

interface VehicleSelectionProps {
  journey: JourneyDetails;
  onSelect: (vehicleId: VehicleCategoryId) => void;
  isProcessing: boolean;
}

export function VehicleSelection({ journey, onSelect, isProcessing }: VehicleSelectionProps) {
  const [options, setOptions] = useState<VehicleOption[]>(
    vehicleCatalog.map((category) => ({ category, available: category.passengerCapacity >= journey.passengers && category.luggageCapacity >= journey.luggage && category.handCarryCapacity >= journey.handCarry })),
  );
  const [selectedId, setSelectedId] = useState<VehicleCategoryId | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFares() {
      const withFares = await Promise.all(
        vehicleCatalog.map(async (category) => {
          const available = category.passengerCapacity >= journey.passengers && category.luggageCapacity >= journey.luggage && category.handCarryCapacity >= journey.handCarry;
          if (!available) return { category, available };
          const fare = await getFareEstimate(journey, category.id);
          return { category, available, fare };
        }),
      );
      if (!cancelled) setOptions(withFares);
    }

    loadFares();
    return () => {
      cancelled = true;
    };
  }, [journey]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {options.map((option) => (
          <VehicleCard
            key={option.category.id}
            option={option}
            selected={selectedId === option.category.id}
            onSelect={() => setSelectedId(option.category.id)}
          />
        ))}
      </div>

      <button
        type="button"
        className={styles.continueButton}
        disabled={!selectedId || isProcessing}
        onClick={() => selectedId && onSelect(selectedId)}
      >
        {isProcessing ? 'Preparing your journey…' : 'Continue with this vehicle'}
      </button>
    </div>
  );
}
