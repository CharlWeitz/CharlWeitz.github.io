// Using the standard MindAR example card for easy testing.
export const MINDAR_IMAGE_TARGET_SRC = "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.2/examples/image-tracking/assets/card-example/card.mind";

// The image reference for the UI help modal
export const MARKER_IMAGE_URL = "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.2/examples/image-tracking/assets/card-example/card.png";

// Physical calculations
// The prompt asks for a 10 cubic cm cube.
// Volume V = 10 cm^3.
// Side length s = cube_root(10) ≈ 2.154 cm.
export const CUBE_VOLUME_CM3 = 10;
export const CUBE_SIDE_LENGTH_CM = Math.pow(CUBE_VOLUME_CM3, 1/3); // ~2.1544 cm

// AR Scale mapping:
// In MindAR, 1 unit in 3D space = width of the tracking image.
// If the user prints the card at standard width (e.g. 10cm or 0.1m), we map relative to that.
// Let's assume a standard reference width of 10cm (0.1m) for the printed card for 1:1 scale logic.
export const REFERENCE_IMAGE_WIDTH_CM = 10; 

// The size of the cube in Three.js units (relative to target width)
export const CUBE_SIZE_AR_UNITS = CUBE_SIDE_LENGTH_CM / REFERENCE_IMAGE_WIDTH_CM; 