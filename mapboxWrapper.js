// mapboxWrapper.js - alternative approach
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import the SDK
const mapbox = require('@mapbox/mapbox-sdk');

// Export the client creator
export function createClient(options) {
    return mapbox(options); // Try without .createClient
}

// Import and export the geocoding service
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
export function geocodingService(client) {
    return mbxGeocoding(client);
}