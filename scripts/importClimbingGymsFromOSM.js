require("dotenv").config();

const admin = require("firebase-admin");
const axios = require("axios");

// Initialize Firebase Admin
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountJson) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT env var is not set");
}

const serviceAccount = JSON.parse(serviceAccountJson);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Overpass API configuration
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// Reverse geocoding cache to avoid duplicate API calls
const geocodeCache = new Map();

/**
 * Reverse-geocode coordinates to get city and address using OSM Nominatim API.
 * Returns { city: string | null, addressLine: string | null }
 */
async function reverseGeocode(lat, lng) {
  const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'ClimbingApp/1.0 (for personal use)',
      },
      timeout: 5000,
    });

    const data = response.data;
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

    const result = {
      city: cityName ? String(cityName).trim() : null,
      addressLine: addressLine ? String(addressLine).trim() : null,
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn(`  ⚠ Reverse-geocode failed for ${lat}, ${lng}: ${error.message}`);
    const result = { city: null, addressLine: null };
    geocodeCache.set(cacheKey, result);
    return result;
  }
}

// Overpass query for climbing gyms in Israel
const overpassQuery = `
  [out:json][timeout:25];
  area["name:en"="Israel"][admin_level=2]->.searchArea;
  (
    node["sport"="climbing"](area.searchArea);
    node["leisure"="climbing"](area.searchArea);
  );
  out body;
`;

/**
 * Import climbing gyms from OpenStreetMap via Overpass API.
 * 
 * This script:
 * - Fetches climbing gyms from OSM in Israel
 * - Extracts name, location, address, and opening hours
 * - Reverse-geocodes coordinates to get addresses for gyms missing address data
 * - Stores them in Firestore (gyms collection)
 * 
 * Data migration note:
 * - Existing gyms will be updated (not duplicated) because we use docId = `osm-${osmId}`
 * - To refresh opening hours and resolved addresses for existing gyms, simply re-run: npm run import:gyms:osm
 * - The merge: true option ensures existing fields are preserved while new fields (like openingHoursRaw, resolvedCity, resolvedAddress) are added
 */
async function main() {
  try {
    console.log("Starting OSM climbing gyms import...");

    // Send request to Overpass API
    console.log("Fetching data from Overpass API...");
    const response = await axios.post(
      OVERPASS_URL,
      `data=${encodeURIComponent(overpassQuery)}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const elements = response.data.elements || [];
    console.log(`Received ${elements.length} elements from Overpass API`);

    // Filter for nodes only
    const nodes = elements.filter((el) => el.type === "node");
    console.log(`Found ${nodes.length} nodes to process`);

    let importedCount = 0;

    // Process each node
    for (const element of nodes) {
      try {
        const osmId = element.id;
        const lat = element.lat;
        const lon = element.lon;
        const tags = element.tags || {};

        // Extract name
        const name = tags.name || tags["name:en"] || tags["name:he"] || "Unnamed Gym";

        // Extract address components
        const city = tags["addr:city"] || tags["addr:place"] || tags.city || "";
        const street = tags["addr:street"] || "";
        const housenumber = tags["addr:housenumber"] || "";
        const postcode = tags["addr:postcode"] || "";

        // Build address string
        const addressParts = [];
        if (street) {
          addressParts.push(street);
          if (housenumber) {
            addressParts.push(housenumber);
          }
        }
        if (city) {
          addressParts.push(city);
        }
        if (postcode) {
          addressParts.push(postcode);
        }
        const address = addressParts.join(", ") || city || "";

        // Extract opening hours from OSM tags
        // opening_hours is a standard OSM tag that can contain strings like:
        // "Mo-Fr 09:00-18:00; Sa 10:00-16:00" or "24/7" etc.
        const openingHoursRaw = tags.opening_hours || null;

        // Always reverse-geocode if we have coordinates to get a reliable address
        // This ensures we always have an address to display instead of "Location not specified"
        let resolvedCity = null;
        let resolvedAddress = null;

        if (lat && lon) {
          console.log(`  🔍 Reverse-geocoding ${name}...`);
          const geocodeResult = await reverseGeocode(lat, lon);
          resolvedCity = geocodeResult.city;
          resolvedAddress = geocodeResult.addressLine;
          
          // Add delay to be gentle to the API
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        // Build Firestore document
        const gymData = {
          name,
          address: address || null,
          city: city || null,
          location: {
            lat,
            lng: lon,
          },
          source: "openstreetmap",
          osmId: osmId,
          tags: tags,
          openingHoursRaw: openingHoursRaw, // Store raw opening_hours string from OSM
          resolvedCity: resolvedCity, // Reverse-geocoded city
          resolvedAddress: resolvedAddress, // Reverse-geocoded address line
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Write to Firestore with merge: true
        // This updates existing documents if they already exist (matched by docId = osm-${osmId})
        // To refresh opening hours and resolved addresses for existing gyms, simply re-run this script:
        // npm run import:gyms:osm
        const docId = `osm-${osmId}`;
        await db.collection("gyms").doc(docId).set(gymData, { merge: true });

        const geocodeNote = needsGeocoding 
          ? ` - Resolved: ${resolvedAddress || resolvedCity || 'none'}`
          : '';
        console.log(`✓ Imported: ${name} (${docId})${openingHoursRaw ? ` - Hours: ${openingHoursRaw}` : ''}${geocodeNote}`);
        importedCount++;
      } catch (error) {
        console.error(`✗ Error processing element ${element.id}:`, error.message);
      }
    }

    console.log(`\nImport complete. Successfully imported ${importedCount} gym(s).`);
    process.exit(0);
  } catch (err) {
    console.error("Import failed:", err);
    process.exit(1);
  }
}

main();

