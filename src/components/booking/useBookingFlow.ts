import { useCallback, useState } from 'react';
import type { BookingRecord, BookingStep, CustomerDetails, JourneyDetails } from '../../models/booking';
import type { FareResult, VehicleCategoryId } from '../../models/vehicle';
import type { PaymentResult } from '../../models/payment';
import { getFareEstimate } from '../../services/fareService';
import { confirmCardPayment, createPaymentIntent } from '../../services/paymentService';
import { createBookingRecord } from '../../services/bookingService';
import { notifyBookingCreated } from '../../services/notificationService';

interface BookingFlowState {
  step: BookingStep;
  journey: JourneyDetails | null;
  vehicleId: VehicleCategoryId | null;
  fare: FareResult | null;
  customer: CustomerDetails | null;
  payment: PaymentResult | null;
  booking: BookingRecord | null;
  clientSecret: string | null;
  isProcessing: boolean;
}

const initialState: BookingFlowState = {
  step: 'journey',
  journey: null,
  vehicleId: null,
  fare: null,
  customer: null,
  payment: null,
  booking: null,
  clientSecret: null,
  isProcessing: false,
};

export function useBookingFlow() {
  const [state, setState] = useState<BookingFlowState>(initialState);

  const submitJourney = useCallback((journey: JourneyDetails) => {
    setState((prev) => ({ ...prev, journey, step: 'vehicle' }));
  }, []);

  const editJourney = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'journey' }));
  }, []);

  const selectVehicle = useCallback(
    async (vehicleId: VehicleCategoryId) => {
      const journey = state.journey;
      if (!journey) return;
      setState((prev) => ({ ...prev, isProcessing: true }));
      const fare = await getFareEstimate(journey, vehicleId);
      setState((prev) => ({ ...prev, vehicleId, fare, step: 'details', isProcessing: false }));
    },
    [state.journey],
  );

  const editVehicle = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'vehicle' }));
  }, []);

  const submitCustomerDetails = useCallback((customer: CustomerDetails) => {
    setState((prev) => ({ ...prev, customer, step: 'review' }));
  }, []);

  const editCustomerDetails = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'details' }));
  }, []);

  // Persists the booking server-side (Batch 4), then creates a Stripe
  // PaymentIntent against it (Batch 5), then moves to the payment step for
  // the customer to enter card details.
  const confirmAndPay = useCallback(async () => {
    if (!state.journey || !state.vehicleId || !state.fare || !state.customer) return;
    setState((prev) => ({ ...prev, isProcessing: true }));

    const booking = await createBookingRecord(state.journey, state.vehicleId, state.customer);
    const { clientSecret } = await createPaymentIntent(booking.reference);

    setState((prev) => ({ ...prev, booking, clientSecret, step: 'payment', isProcessing: false }));
  }, [state.journey, state.vehicleId, state.fare, state.customer]);

  const submitPayment = useCallback(
    async (getCardElement: () => unknown) => {
      if (!state.clientSecret) return;
      setState((prev) => ({ ...prev, isProcessing: true }));

      const cardElement = getCardElement();
      const payment = await confirmCardPayment(state.clientSecret, cardElement);

      if (payment.status === 'success' && state.booking) {
        const confirmedBooking: BookingRecord = { ...state.booking, payment };
        await notifyBookingCreated(confirmedBooking);
        setState((prev) => ({ ...prev, payment, booking: confirmedBooking, step: 'confirmation', isProcessing: false }));
        return;
      }

      setState((prev) => ({ ...prev, payment, isProcessing: false }));
    },
    [state.clientSecret, state.booking],
  );

  const retryPayment = useCallback(() => {
    setState((prev) => ({ ...prev, payment: null, step: 'review' }));
  }, []);

  const startNewBooking = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    actions: {
      submitJourney,
      editJourney,
      selectVehicle,
      editVehicle,
      submitCustomerDetails,
      editCustomerDetails,
      confirmAndPay,
      submitPayment,
      retryPayment,
      startNewBooking,
    },
  };
}