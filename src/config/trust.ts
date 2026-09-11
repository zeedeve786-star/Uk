export interface TrustPoint {
  title: string;
  description: string;
}

export const trustPoints: TrustPoint[] = [
  {
    title: 'Pre-booked journeys',
    description: 'Confirm your pickup in advance rather than relying on street hailing.',
  },
  {
    title: 'Clear pricing',
    description: 'See your fare before you travel, with any discount shown separately.',
  },
  {
    title: 'Human support',
    description: 'Speak with a person for questions, changes or existing bookings.',
  },
  {
    title: 'Secure online payment',
    description: 'Payments are processed through Stripe, not stored on this site.',
  },
];
