import type { Review } from '../models/review';

export const demoReviews: Review[] = [
  {
    id: 'r1',
    rating: 5,
    name: 'Sarah M.',
    category: 'Airport Transfer',
    text: 'Driver was waiting when we landed and the car was spotless. Made a long flight much easier.',
    approved: true,
  },
  {
    id: 'r2',
    rating: 4,
    name: 'James H.',
    category: 'Cruise Transfer',
    text: 'Smooth pickup from the port, no issues with the group luggage.',
    approved: true,
  },
  {
    id: 'r3',
    rating: 5,
    name: 'Priya K.',
    category: 'Events',
    text: 'Booked an 8-seater for a family event, communication beforehand was clear and helpful.',
    approved: true,
  },
];
