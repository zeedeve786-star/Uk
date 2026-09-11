import type { QuoteContactDetails, QuoteJourneyDetails, QuoteRequestRecord } from '../models/quote';

export async function submitQuoteRequest(
  contact: QuoteContactDetails,
  journey: QuoteJourneyDetails,
): Promise<QuoteRequestRecord> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    reference: `QT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    contact,
    journey,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
}
