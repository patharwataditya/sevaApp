// Public backend endpoint for SevaApp.
//
// This is the API Gateway URL produced by backend/deploy.sh. It is NOT a secret
// (reads are public), so it is safe to ship in the app bundle. If you redeploy
// to a new API, update this value (see backend/.deploy-output.json → apiUrl).
export const API_URL = 'https://a3isjf7j33.execute-api.us-east-1.amazonaws.com';

// How often to refresh data from the network in the background (ms).
export const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
