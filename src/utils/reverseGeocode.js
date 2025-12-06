/**
 * Client-side reverse-geocoding utility using OSM Nominatim API.
 * Returns { city: string | null, addressLine: string | null }
 */
export async function reverseGeocode(lat, lng) {
  if (!lat || !lng || typeof lat !== 'number' || typeof lng !== 'number') {
    return { city: null, addressLine: null };
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ClimbingApp/1.0 (for personal use)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    // Extract city (prefer city, fall back to town, village, etc.)
    let cityName = address.city || address.town || address.village || 
                   address.municipality || address.county || null;

    // Extract address line (street + housenumber, or just street)
    let addressLine = null;
    if (address.road) {
      if (address.house_number) {
        addressLine = `${address.road} ${address.house_number}`;
      } else {
        addressLine = address.road;
      }
    }

    return {
      city: cityName ? String(cityName).trim() : null,
      addressLine: addressLine ? String(addressLine).trim() : null,
    };
  } catch (error) {
    console.warn(`Reverse-geocode failed for ${lat}, ${lng}:`, error.message);
    return { city: null, addressLine: null };
  }
}

