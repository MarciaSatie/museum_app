import { db } from "./firebase-init.js";

/**
 * Track a visit to a resource (museum or exhibition)
 * Increments the view count atomically
 */
export async function trackVisit(resourceType, resourceId) {
  const visitRef = db.ref(`visits/${resourceType}/${resourceId}`);

  await visitRef.transaction((current) => {
    return (current || 0) + 1;
  });
}

/**
 * Get the visit count for a specific resource
 * Returns 0 if resource has never been viewed
 */
export async function getVisitCount(resourceType, resourceId) {
  const visitRef = db.ref(`visits/${resourceType}/${resourceId}`);
  const snapshot = await visitRef.once("value");
  return snapshot.val() || 0;
}

/**
 * Get the most viewed resources of a specific type
 * Returns array sorted by views (highest first)
 */
export async function getMostViewed(resourceType, limit = 5) {
  const visitsRef = db.ref(`visits/${resourceType}`);
  const snapshot = await visitsRef.orderByValue().limitToLast(limit).once("value");

  const results = [];
  snapshot.forEach((child) => {
    results.unshift({ id: child.key, views: child.val() });
  });
  return results;
}