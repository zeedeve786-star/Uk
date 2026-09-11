import type { SupportRequest, SupportRequestResult } from '../models/support';

export async function submitSupportRequest(request: SupportRequest): Promise<SupportRequestResult> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    reference: `SR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    acknowledged: true,
  };
}
