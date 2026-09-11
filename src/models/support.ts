export type SupportTopic =
  | 'ask-question'
  | 'report-issue'
  | 'availability'
  | 'request-quote'
  | 'start-booking'
  | 'complete-booking'
  | 'existing-booking'
  | 'cancel-change-booking'
  | 'general-information';

export interface SupportRequest {
  topic: SupportTopic;
  name: string;
  contact: string;
  message: string;
}

export interface SupportRequestResult {
  reference: string;
  acknowledged: boolean;
}
