import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  private async getGoogleApiKey(): Promise<string> {
    const integration = await this.prisma.apiIntegration.findFirst({
      where: { provider: 'Google', status: 'ACTIVE' },
    });

    if (!integration?.apiKey) {
      throw new ServiceUnavailableException('Google Maps API is not configured');
    }

    return integration.apiKey;
  }

  async autocomplete(input: string) {
    const value = input.trim();

    if (!value) {
      return { suggestions: [] };
    }

    const apiKey = await this.getGoogleApiKey();

    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text',
      },
      body: JSON.stringify({
        input: value,
        includedRegionCodes: ['gb'],
      }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException('Google Places request failed');
    }

    const data = await response.json();

    return {
      suggestions: (data.suggestions ?? [])
        .map((item: any) => ({
          placeId: item.placePrediction?.placeId ?? '',
          text: item.placePrediction?.text?.text ?? '',
        }))
        .filter((item: { placeId: string; text: string }) => item.text),
    };
  }
}
