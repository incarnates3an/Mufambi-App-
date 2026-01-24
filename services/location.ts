/**
 * Free Location Services using OpenStreetMap Nominatim
 * No API key required - completely free
 */

export interface LocationResult {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  country?: string;
  formattedAddress?: string;
}

export interface PlaceSearchResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  type?: string;
}

/**
 * Reverse geocoding: Convert coordinates to address
 * Uses OpenStreetMap Nominatim (free, no API key)
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<LocationResult> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Mufambi-AI-Ride-Hailing-App'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    const address = data.address || {};
    const formattedAddress = data.display_name || 'Unknown Location';

    // Build a clean address string
    const parts = [];
    if (address.road) parts.push(address.road);
    if (address.suburb) parts.push(address.suburb);
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }

    const cleanAddress = parts.length > 0 ? parts.join(', ') : formattedAddress;

    return {
      lat,
      lng,
      address: cleanAddress,
      city: address.city || address.town || address.village,
      country: address.country,
      formattedAddress
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      lat,
      lng,
      address: `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      formattedAddress: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
    };
  }
};

/**
 * Forward geocoding: Search for places by name
 * Uses OpenStreetMap Nominatim (free, no API key)
 */
export const searchPlaces = async (query: string, centerLat?: number, centerLng?: number): Promise<PlaceSearchResult[]> => {
  if (!query || query.length < 2) return [];

  try {
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;

    // If center coordinates provided, bias results towards that location
    if (centerLat && centerLng) {
      url += `&viewbox=${centerLng - 0.5},${centerLat - 0.5},${centerLng + 0.5},${centerLat + 0.5}&bounded=0`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mufambi-AI-Ride-Hailing-App'
      }
    });

    if (!response.ok) {
      throw new Error('Place search failed');
    }

    const data = await response.json();

    return data.map((place: any) => ({
      name: place.display_name.split(',')[0], // Get main name
      address: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      type: place.type
    }));
  } catch (error) {
    console.error('Place search error:', error);
    return [];
  }
};

/**
 * Get current position using browser geolocation API
 * Returns a promise with high-accuracy location
 */
export const getCurrentPosition = (): Promise<{ lat: number; lng: number; accuracy: number }> => {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Check if geolocation is available and permitted
 */
export const checkLocationPermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
  if (!('permissions' in navigator)) {
    return 'prompt';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return result.state as 'granted' | 'denied' | 'prompt';
  } catch (error) {
    console.error('Permission check failed:', error);
    return 'prompt';
  }
};

/**
 * Calculate distance between two coordinates (in kilometers)
 * Uses Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};
