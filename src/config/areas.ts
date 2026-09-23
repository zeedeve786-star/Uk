export interface AreasConfig {
  supportingCopy: string;
  // Populate once confirmed service areas are available; kept empty until then
  // rather than inventing coverage claims.
  regions: string[];
}

export const areasConfig: AreasConfig = {
  supportingCopy:
    'Availability depends on the specific journey and service area. Confirmed regions will appear here once agreed with the client.',
  regions: [],
};
