import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config";
import { formatOpeningHours } from "../src/utils/openingHoursFormatter";

const GYMS_COLLECTION = "gyms";

/**
 * Normalize a gym document from Firestore into a consistent UI shape.
 * Handles both OSM-imported gyms and manually-created gyms.
 * Returns a NormalizedGym object with consistent structure.
 */
export function normalizeGymDocument(id, data) {
  // 1. Name - always a string
  let nameCandidate =
    data.name ||
    data.location?.name ||
    data.tags?.name ||
    "Unnamed Gym";

  if (typeof nameCandidate === "object" && nameCandidate !== null) {
    nameCandidate = nameCandidate.name || nameCandidate.label || "Unnamed Gym";
  }
  const name = (nameCandidate || "Unnamed Gym").toString();

  // Helper to safely convert to string or null
  const safeString = (value) =>
    typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : null;

  // 2. City - prioritize resolvedCity, then extract from multiple OSM tag sources
  let cityCandidate =
    data.resolvedCity ||
    data.city ||
    data.tags?.city ||
    data.tags?.["addr:city"] ||
    data.tags?.addr_city ||
    data.tags?.["addr:place"] ||
    null;

  if (typeof cityCandidate === "object" && cityCandidate !== null) {
    cityCandidate = cityCandidate.city || cityCandidate.name || cityCandidate.label || null;
  }
  const city = safeString(cityCandidate);

  // 3. Address - prioritize resolvedAddress, then extract from OSM tags
  let addressCandidate = data.resolvedAddress || data.address || null;
  
  // If no resolved or direct address, try to build from OSM tags
  if (!addressCandidate && data.tags) {
    const street = data.tags["addr:street"] || data.tags["addr:place"] || null;
    const houseNumber = data.tags["addr:housenumber"] || null;
    
    if (street && houseNumber) {
      addressCandidate = `${street} ${houseNumber}`;
    } else if (street) {
      addressCandidate = street;
    } else if (data.tags["addr:place"] && !city) {
      // Use addr:place as address if we don't have a city
      addressCandidate = data.tags["addr:place"];
    }
  }
  
  if (typeof addressCandidate === "object" && addressCandidate !== null) {
    addressCandidate = addressCandidate.address || addressCandidate.label || null;
  }
  const address = safeString(addressCandidate);

  // 4. Coordinates - extract from various possible locations and coerce to numbers
  let latCandidate =
    data.coordinates?.lat ??
    data.latitude ??
    data.lat ??
    data.Location?.lat ??
    data.location?.lat ??
    data.coords?.lat ??
    null;

  let lngCandidate =
    data.coordinates?.lng ??
    data.longitude ??
    data.lng ??
    data.Location?.lng ??
    data.location?.lng ??
    data.coords?.lng ??
    null;

  // Coerce to numbers, fall back to null if NaN
  const lat = latCandidate != null ? parseFloat(latCandidate) : null;
  const lng = lngCandidate != null ? parseFloat(lngCandidate) : null;

  const coordinates = {
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  };

  // 5. Rating - number or null
  const rating =
    typeof data.rating === "number" && Number.isFinite(data.rating)
      ? data.rating
      : null;

  // 6. Source - 'osm' or 'manual'
  const sourceValue = data.source || "manual";
  const source = sourceValue === "openstreetmap" ? "osm" : "manual";

  // 7. OSM ID - only for OSM gyms
  const osmId = data.osmId || data.location?.osmId || null;

  // 8. Opening hours - extract from openingHoursRaw or tags.opening_hours
  // This stores the raw opening_hours string from OSM (e.g., "Mo-Fr 09:00-18:00; Sa 10:00-16:00")
  // We keep it as a string for backward compatibility
  const openingHoursCandidate = data.openingHoursRaw || data.tags?.opening_hours || null;
  const openingHours = safeString(openingHoursCandidate);

  // 8b. Formatted opening hours lines - human-readable array of formatted strings
  const openingHoursLines = formatOpeningHours(openingHours);

  // 9. Timestamps
  const createdAt = data.createdAt || null;
  const updatedAt = data.updatedAt || null;

  return {
    id,
    name,
    city,
    address,
    rating,
    coordinates,
    source,
    osmId,
    openingHours,
    openingHoursLines,
    createdAt,
    updatedAt,
    // Pass through raw data for reference
    raw: data,
  };
}

/**
 * Subscribe to gyms collection.
 * Calls the callback with an array of normalized gym objects.
 */
export function subscribeToGyms(callback) {
  const q = query(collection(db, GYMS_COLLECTION));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const gyms = snapshot.docs.map((docSnap) =>
      normalizeGymDocument(docSnap.id, docSnap.data())
    );
    callback(gyms);
  });

  return unsubscribe;
}

/**
 * Add a new gym created from the app form (not from OSM).
 * Store it in a way that works nicely with the UI.
 * Expects gymData with: name, city, address (optional), rating (optional), coordinates { lat, lng }
 */
export async function addManualGym(gymData) {
  // Normalize coordinates to ensure they're numbers
  const coordinates = {
    lat: gymData.coordinates?.lat != null ? parseFloat(gymData.coordinates.lat) : null,
    lng: gymData.coordinates?.lng != null ? parseFloat(gymData.coordinates.lng) : null,
  };

  // If coordinates are invalid, set to null
  if (!Number.isFinite(coordinates.lat)) coordinates.lat = null;
  if (!Number.isFinite(coordinates.lng)) coordinates.lng = null;

  return await addDoc(collection(db, GYMS_COLLECTION), {
    name: gymData.name || "Unnamed Gym",
    city: gymData.city || null,
    address: gymData.address || null,
    rating: gymData.rating != null && Number.isFinite(gymData.rating) ? gymData.rating : null,
    coordinates: coordinates,
    source: "manual",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update an existing gym document.
 * Handles coordinates normalization if provided.
 */
export async function updateGym(gymId, partialData) {
  const ref = doc(db, GYMS_COLLECTION, gymId);
  
  // Normalize coordinates if provided
  let updateData = { ...partialData };
  if (updateData.coordinates) {
    const coords = updateData.coordinates;
    updateData.coordinates = {
      lat: coords.lat != null && Number.isFinite(coords.lat) ? coords.lat : null,
      lng: coords.lng != null && Number.isFinite(coords.lng) ? coords.lng : null,
    };
  }
  
  await updateDoc(ref, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a gym by id.
 */
export async function deleteGym(gymId) {
  const ref = doc(db, GYMS_COLLECTION, gymId);
  await deleteDoc(ref);
}

