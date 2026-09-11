export interface Review {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  name: string;
  category?: string;
  text: string;
  approved: boolean;
}
