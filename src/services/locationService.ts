import { API_BASE_URL } from '../config/api';

export interface LocationSuggestion {
  placeId: string;
  text: string;
}

interface AutocompleteResponse {
  suggestions: LocationSuggestion[];
}

export async function getLocationSuggestions(
  input: string,
): Promise<LocationSuggestion[]> {
  const value = input.trim();

  if (value.length < 3) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/location/autocomplete?input=${encodeURIComponent(value)}`,
  );

  if (!response.ok) {
    return [];
  }

  const data =
    (await response.json()) as AutocompleteResponse;

  return data.suggestions ?? [];
}