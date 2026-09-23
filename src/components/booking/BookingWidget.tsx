import { useMemo } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../../services/stripeClient';
import { siteConfig } from '../../config/site';
import { footerContact } from '../../config/footer';
import { useBookingFlow } from './useBookingFlow';
import { JourneyForm } from './JourneyForm';
import { VehicleSelection } from '../vehicles/VehicleSelection';
import { JourneySummary } from './JourneySummary';
import { CustomerDetailsForm } from './CustomerDetailsForm';
import { ReviewBooking } from './ReviewBooking';
import { PaymentStep } from './PaymentStep';
import { BookingConfirmation } from './BookingConfirmation';
import styles from './BookingWidget.module.css';

export function BookingWidget() {
  const { state, actions } = useBookingFlow();
  const stripePromise = useMemo(() => getStripe(), []);

  return (
    <div className={styles.widget}>
      <header className={styles.header}>
        <div className={styles.headerGlow} />

        <div className={styles.headerTitle}>
          <span className={styles.titleMark} />
          <div>
            <h2>Book your journey</h2>
            <p>Airport, railway, cruise and event transfers</p>
          </div>
        </div>

        <a
          href={`tel:${siteConfig.phoneNumber.tel}`}
          className={styles.phone}
        >
          <span>Call us</span>
          <strong>{siteConfig.phoneNumber.display}</strong>
        </a>
      </header>

      <div className={styles.contactLine}>
        <span>Need help with your booking?</span>
        <div>
          <a href={`tel:${siteConfig.phoneNumber.tel}`}>
            {siteConfig.phoneNumber.display}
          </a>
          <i />
          <a href={`mailto:${footerContact.email}`}>
            {footerContact.email}
          </a>
        </div>
      </div>

      <main className={styles.formArea}>
        <div className={styles.stepTransition} key={state.step}>
          {state.step === 'journey' && (
            <JourneyForm
              initialValue={state.journey}
              onSubmit={actions.submitJourney}
            />
          )}

          {state.step === 'vehicle' && state.journey && (
            <div className={styles.stepStack}>
              <JourneySummary
                journey={state.journey}
                onEdit={actions.editJourney}
              />
              <VehicleSelection
                journey={state.journey}
                onSelect={actions.selectVehicle}
                isProcessing={state.isProcessing}
              />
            </div>
          )}

          {state.step === 'details' && (
            <CustomerDetailsForm
              initialValue={state.customer}
              onSubmit={actions.submitCustomerDetails}
              onBack={actions.editVehicle}
            />
          )}

          {state.step === 'review' &&
            state.journey &&
            state.vehicleId &&
            state.fare &&
            state.customer && (
              <ReviewBooking
                journey={state.journey}
                vehicleId={state.vehicleId}
                fare={state.fare}
                customer={state.customer}
                onEditJourney={actions.editJourney}
                onEditVehicle={actions.editVehicle}
                onEditCustomer={actions.editCustomerDetails}
                onConfirm={actions.confirmAndPay}
                isProcessing={state.isProcessing}
              />
            )}

          {state.step === 'payment' &&
            state.fare &&
            state.clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret: state.clientSecret }}
              >
                <PaymentStep
                  amount={state.fare.finalAmount ?? state.fare.amount}
                  payment={state.payment}
                  isProcessing={state.isProcessing}
                  onSubmitPayment={actions.submitPayment}
                  onRetry={actions.retryPayment}
                />
              </Elements>
            )}

          {state.step === 'confirmation' && state.booking && (
            <BookingConfirmation
              booking={state.booking}
              onStartNewBooking={actions.startNewBooking}
            />
          )}
        </div>
      </main>

      <footer className={styles.widgetFooter}>
        <span className={styles.footerMessage}>✦ Your journey starts with a better ride.</span>
      </footer></div>
  );
}
