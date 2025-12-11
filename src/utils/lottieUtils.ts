/**
 * Utility functions for working with Lottie animations
 */

/**
 * Calculate animation duration in milliseconds from Lottie JSON data
 * @param lottieData - The Lottie JSON object (from require())
 * @returns Duration in milliseconds, or 0 if calculation fails
 */
export const getLottieDuration = (lottieData: any): number => {
  try {
    if (!lottieData) {
      return 0;
    }

    // In React Native, require() for JSON files returns the parsed JSON object
    // Check if it's an object with the expected Lottie structure
    if (typeof lottieData !== 'object') {
      console.warn('Lottie data is not an object:', typeof lottieData);
      return 0;
    }

    // Lottie JSON structure: { fr: 24, ip: 0, op: 192 }
    // Duration in ms = ((op - ip) / fr) * 1000
    const fr = lottieData.fr || 30; // Default 30 fps if not specified
    const ip = lottieData.ip || 0; // In point (start frame)
    const op = lottieData.op || 0; // Out point (end frame)

    // Validate values
    if (typeof fr !== 'number' || typeof ip !== 'number' || typeof op !== 'number') {
      console.warn('Invalid Lottie frame data:', { fr, ip, op });
      return 0;
    }

    if (op > ip && fr > 0 && isFinite(fr) && isFinite(ip) && isFinite(op)) {
      const duration = ((op - ip) / fr) * 1000;
      const rounded = Math.round(duration);
      return rounded > 0 ? rounded : 0;
    }
  } catch (e) {
    console.warn('Failed to calculate Lottie duration:', e);
  }
  return 0;
};

