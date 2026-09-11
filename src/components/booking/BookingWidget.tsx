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

  return (
    <div className={styles.widget}>
      <div className={styles.stepTransition} key={state.step}>
        {state.step === 'journey' && (
          <JourneyForm initialValue={state.journey} onSubmit={actions.submitJourney} />
        )}

        {state.step === 'vehicle' && state.journey && (
          <div className={styles.stepStack}>
            <JourneySummary journey={state.journey} onEdit={actions.editJourney} />
            <VehicleSelection journey={state.journey} onSelect={actions.selectVehicle} isProcessing={state.isProcessing} />
          </div>
        )}

        {state.step === 'details' && (
          <CustomerDetailsForm initialValue={state.customer} onSubmit={actions.submitCustomerDetails} onBack={actions.editVehicle} />
        )}

        {state.step === 'review' && state.journey && state.vehicleId && state.fare && state.customer && (
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

        {state.step === 'payment' && state.fare && (
          <PaymentStep
            amount={state.fare.finalAmount ?? state.fare.amount}
            payment={state.payment}
            isProcessing={state.isProcessing}
            onRetry={actions.retryPayment}
          />
        )}

        {state.step === 'confirmation' && state.booking && (
          <BookingConfirmation booking={state.booking} onStartNewBooking={actions.startNewBooking} />
        )}
      </div>
    </div>
  );
}
