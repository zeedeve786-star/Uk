
import { useState } from 'react';
import type { JourneyDetails, JourneyValidationErrors, ServiceType } from '../../models/booking';
import { serviceContent } from '../../config/services';
import { bookingRules } from '../../config/booking-rules';
import styles from './JourneyForm.module.css';

interface JourneyFormProps {
  initialValue?: JourneyDetails | null;
  onSubmit: (journey: JourneyDetails) => void;
}

const emptyJourney = (serviceType: ServiceType): JourneyDetails => ({
  serviceType,
  pickup: '',
  viaStops: [],
  dropoff: '',
  date: '',
  time: '',
  passengers: 1,
  luggage: 0,
  referencePoint: '',
  eventType: '',
  groupNotes: '',
  distanceMiles: 0,
});

function validate(journey: JourneyDetails): JourneyValidationErrors {
  const errors: JourneyValidationErrors = {};

  if (!journey.pickup.trim()) errors.pickup = 'Enter a pickup location.';
  if (!journey.dropoff.trim()) errors.dropoff = 'Enter a destination.';
  if (!journey.date) errors.date = 'Select a travel date.';
  if (!journey.time) errors.time = 'Select a travel time.';
  if (journey.passengers < 1) errors.passengers = 'Enter at least one passenger.';
  if (!journey.distanceMiles || journey.distanceMiles <= 0) {
    errors.distanceMiles = 'Enter the approximate journey distance in miles.';
  }

  if (!journey.referencePoint?.trim()) {
    const content = serviceContent.find((s) => s.id === journey.serviceType);
    errors.referencePoint = `Enter the ${content?.referenceLabel.toLowerCase() ?? 'reference point'}.`;
  }

  if (journey.date && journey.time) {
    const travelAt = new Date(`${journey.date}T${journey.time}`);
    const now = new Date();

    if (Number.isNaN(travelAt.getTime())) {
      errors.date = 'Enter a valid date and time.';
    } else {
      const hoursUntilTravel =
        (travelAt.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilTravel < bookingRules.minimumAdvanceHours) {
        errors.advanceNotice =
          `Journeys need at least ${bookingRules.minimumAdvanceHours} hours' notice.`;
      }
    }
  }

  return errors;
}

export function JourneyForm({ initialValue, onSubmit }: JourneyFormProps) {
  const [journey, setJourney] = useState<JourneyDetails>(
    initialValue ?? emptyJourney('airport'),
  );
  const [errors, setErrors] = useState<JourneyValidationErrors>({});
  const [viaInput, setViaInput] = useState('');

  const activeService =
    serviceContent.find((s) => s.id === journey.serviceType) ??
    serviceContent[0];

  function updateField<K extends keyof JourneyDetails>(
    key: K,
    value: JourneyDetails[K],
  ) {
    setJourney((prev) => ({ ...prev, [key]: value }));
  }

  function handleServiceChange(serviceType: ServiceType) {
    setJourney((prev) => ({
      ...emptyJourney(serviceType),
      pickup: prev.pickup,
      dropoff: prev.dropoff,
    }));
    setErrors({});
  }

  function addViaStop() {
    if (!viaInput.trim()) return;

    setJourney((prev) => ({
      ...prev,
      viaStops: [...prev.viaStops, viaInput.trim()],
    }));

    setViaInput('');
  }

  function removeViaStop(index: number) {
    setJourney((prev) => ({
      ...prev,
      viaStops: prev.viaStops.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate(journey);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(journey);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHeader}>
        <div className={styles.formHeaderTop}>
          <div>
            <p className={styles.eyebrow}>Instant online quote</p>
            <h3>Plan your journey</h3>
          </div>

          <span className={styles.quickBadge}>Quick booking</span>
        </div>

        <p>Tell us where you are going and we will take it from there.</p>
      </div>

      <fieldset className={styles.serviceGroup}>
        <legend className={styles.legend}>Journey type</legend>

        <div
          className={styles.serviceTabs}
          role="radiogroup"
          aria-label="Journey type"
        >
          {serviceContent.map((service) => (
            <button
              key={service.id}
              type="button"
              role="radio"
              aria-checked={journey.serviceType === service.id}
              className={styles.serviceTab}
              data-active={journey.serviceType === service.id}
              onClick={() => handleServiceChange(service.id)}
            >
              {service.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.grid}>
        <section className={styles.routeSection}>
          <div className={styles.sectionHeading}>
            <strong>Journey route</strong>
            <span>Start → destination</span>
          </div>

          <label className={styles.routeField}>
            <span className={styles.labelText}>
              {activeService.referenceLabel}
            </span>
            <input
              type="text"
              value={journey.referencePoint}
              onChange={(e) =>
                updateField('referencePoint', e.target.value)
              }
              placeholder={
                activeService.id === 'airport'
                  ? 'Airport name or terminal'
                  : `Enter ${activeService.referenceLabel.toLowerCase()}`
              }
              aria-invalid={Boolean(errors.referencePoint)}
              aria-describedby={
                errors.referencePoint ? 'error-reference' : undefined
              }
            />
            {errors.referencePoint && (
              <span
                id="error-reference"
                className={styles.error}
                role="alert"
              >
                {errors.referencePoint}
              </span>
            )}
          </label>

          {journey.serviceType === 'event' && (
            <label className={styles.field} style={{ marginTop: 9 }}>
              <span className={styles.labelText}>Event type</span>
              <input
                type="text"
                value={journey.eventType}
                onChange={(e) =>
                  updateField('eventType', e.target.value)
                }
                placeholder="Wedding, corporate event, etc."
              />
            </label>
          )}

          <label className={styles.routeField}>
            <span className={styles.labelText}>From</span>
            <input
              type="text"
              value={journey.pickup}
              onChange={(e) => updateField('pickup', e.target.value)}
              placeholder="Pickup location"
              aria-invalid={Boolean(errors.pickup)}
              aria-describedby={
                errors.pickup ? 'error-pickup' : undefined
              }
            />
            {errors.pickup && (
              <span id="error-pickup" className={styles.error} role="alert">
                {errors.pickup}
              </span>
            )}
          </label>

          <label className={styles.routeField}>
            <span className={styles.labelText}>To</span>
            <input
              type="text"
              value={journey.dropoff}
              onChange={(e) => updateField('dropoff', e.target.value)}
              placeholder="Destination"
              aria-invalid={Boolean(errors.dropoff)}
              aria-describedby={
                errors.dropoff ? 'error-dropoff' : undefined
              }
            />
            {errors.dropoff && (
              <span id="error-dropoff" className={styles.error} role="alert">
                {errors.dropoff}
              </span>
            )}
          </label>
        </section>

        <section className={styles.detailsSection}>
          <div className={styles.sectionHeading}>
            <strong>Trip details</strong>
            <span>Travel information</span>
          </div>

            <label
              className={styles.field}
              style={{ gridColumn: 'span 3' }}
            >
              <span className={styles.labelText}>Travel date</span>
              <input
                type="date"
                value={journey.date}
                onChange={(e) => updateField('date', e.target.value)}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={
                  errors.date ? 'error-date' : undefined
                }
              />
              {errors.date && (
                <span id="error-date" className={styles.error} role="alert">
                  {errors.date}
                </span>
              )}
            </label>

            <label
              className={styles.field}
              style={{ gridColumn: 'span 3' }}
            >
              <span className={styles.labelText}>Travel time</span>
              <input
                type="time"
                value={journey.time}
                onChange={(e) => updateField('time', e.target.value)}
                aria-invalid={Boolean(errors.time)}
                aria-describedby={
                  errors.time ? 'error-time' : undefined
                }
              />
              {errors.time && (
                <span id="error-time" className={styles.error} role="alert">
                  {errors.time}
                </span>
              )}
            </label>

            <label
              className={styles.field}
              style={{ gridColumn: 'span 2' }}
            >
              <span className={styles.labelText}>Passengers</span>
              <input
                type="number"
                min={1}
                max={16}
                value={journey.passengers}
                onChange={(e) =>
                  updateField('passengers', Number(e.target.value))
                }
                aria-invalid={Boolean(errors.passengers)}
                aria-describedby={
                  errors.passengers ? 'error-passengers' : undefined
                }
              />
              {errors.passengers && (
                <span
                  id="error-passengers"
                  className={styles.error}
                  role="alert"
                >
                  {errors.passengers}
                </span>
              )}
            </label>

            <label
              className={styles.field}
              style={{ gridColumn: 'span 2' }}
            >
              <span className={styles.labelText}>Luggage</span>
              <input
                type="number"
                min={0}
                max={20}
                value={journey.luggage}
                onChange={(e) =>
                  updateField('luggage', Number(e.target.value))
                }
              />
            </label>

            <label
              className={styles.field}
              style={{ gridColumn: 'span 2' }}
            >
              <span className={styles.labelText}>Approx. miles</span>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={journey.distanceMiles || ''}
                onChange={(e) =>
                  updateField('distanceMiles', Number(e.target.value))
                }
                placeholder="e.g. 25"
                aria-invalid={Boolean(errors.distanceMiles)}
                aria-describedby={
                  errors.distanceMiles ? 'error-distance' : undefined
                }
              />
              {errors.distanceMiles && (
                <span
                  id="error-distance"
                  className={styles.error}
                  role="alert"
                >
                  {errors.distanceMiles}
                </span>
              )}
            </label>

            <div className={styles.fieldWide}>
              <span className={styles.labelText}>Via / stops</span>

              <div className={styles.viaRow}>
                <input
                  type="text"
                  value={viaInput}
                  onChange={(e) => setViaInput(e.target.value)}
                  placeholder="Optional stop"
                  aria-label="Optional additional stop"
                />

                <button
                  type="button"
                  className={styles.viaAdd}
                  onClick={addViaStop}
                >
                  + Add
                </button>
              </div>

              {journey.viaStops.length > 0 && (
                <ul className={styles.viaList}>
                  {journey.viaStops.map((stop, index) => (
                    <li key={`${stop}-${index}`}>
                      {stop}
                      <button
                        type="button"
                        onClick={() => removeViaStop(index)}
                        aria-label={`Remove ${stop}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
        </section>

        {journey.serviceType === 'event' && (
          <label className={styles.fieldWide}>
            <span className={styles.labelText}>
              Group information (optional)
            </span>
            <textarea
              value={journey.groupNotes}
              onChange={(e) =>
                updateField('groupNotes', e.target.value)
              }
              rows={3}
              placeholder="Group size, accessibility needs, timing details"
            />
          </label>
        )}
      </div>

      {errors.advanceNotice && (
        <p className={styles.advanceError} role="alert">
          {errors.advanceNotice}
        </p>
      )}

      <div className={styles.formFooter}>
        <button type="submit" className={styles.submit}>
          Continue to vehicle&nbsp; →
        </button>
      </div>
    </form>
  );
}
