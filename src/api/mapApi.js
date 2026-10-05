import axiosClient from "./axiosClient";

/**
 * Map/Geocoding API
 * 
 * Backend endpoints:
 * - GET /api/v1/maps/autocomplete?input=...
 * - GET /api/v1/maps/place?placeId=...
 */

/**
 * Get address autocomplete suggestions
 * @param {string} input - Search input
 * @returns {Promise<Array>} List of place predictions
 */
export async function autocompleteAddress(input) {
  const response = await axiosClient.get(`/maps/autocomplete?input=${encodeURIComponent(input)}`);
  return (response.predictions || []).map((p) => ({
    placeId: p.place_id,
    moTa: p.description,
    chinh: p.structured_formatting?.main_text || p.description,
    phu: p.structured_formatting?.secondary_text || '',
  }));
}

/**
 * Get place detail by place ID
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} Place detail with lat/lng
 */
export async function getPlaceDetail(placeId) {
  const response = await axiosClient.get(`/maps/place?placeId=${encodeURIComponent(placeId)}`);
  const loc = response.result?.geometry?.location;
  return { lat: loc?.lat ?? null, lng: loc?.lng ?? null };
}