// MediaPipe Hand Landmarker wrapper.
// The library, WASM runtime and model are self-hosted under /public and only
// loaded when the scanner is opened (dynamic import keeps them out of the
// initial bundle).

const WASM_BASE = '/mediapipe/wasm';
const MODEL_PATH = '/models/hand_landmarker.task';

/** MediaPipe landmark indices used throughout the app. */
export const LM = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
};

/** Bone connections for drawing the hand skeleton. */
export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

let visionPromise = null;
const landmarkers = { IMAGE: null, VIDEO: null };

async function loadVision() {
  if (!visionPromise) {
    visionPromise = (async () => {
      const mod = await import('@mediapipe/tasks-vision');
      const fileset = await mod.FilesetResolver.forVisionTasks(WASM_BASE);
      return { mod, fileset };
    })().catch((err) => {
      visionPromise = null;
      throw err;
    });
  }
  return visionPromise;
}

async function createLandmarker(runningMode) {
  const { mod, fileset } = await loadVision();
  const options = (delegate) => ({
    baseOptions: { modelAssetPath: MODEL_PATH, delegate },
    runningMode,
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  try {
    return await mod.HandLandmarker.createFromOptions(fileset, options('GPU'));
  } catch (gpuErr) {
    console.warn('[handDetection] GPU delegate unavailable, falling back to CPU', gpuErr);
    return mod.HandLandmarker.createFromOptions(fileset, options('CPU'));
  }
}

/**
 * Returns a cached landmarker for the given running mode.
 * @param {'IMAGE'|'VIDEO'} mode
 */
export async function getHandLandmarker(mode = 'IMAGE') {
  if (!landmarkers[mode]) {
    landmarkers[mode] = createLandmarker(mode).catch((err) => {
      landmarkers[mode] = null;
      throw err;
    });
  }
  return landmarkers[mode];
}

/**
 * MediaPipe's documentation says handedness assumes a mirrored (selfie) image.
 * Tested on un-mirrored, palm-facing photos (the only pose we accept), the
 * label already matched the physical hand in every sample, so it is used as-is.
 * Palm orientation is checked separately from landmark geometry
 * (see utils/imageValidation.js → isPalmFacing).
 */
function physicalHand(label) {
  if (label === 'Left') return 'left';
  if (label === 'Right') return 'right';
  return 'unknown';
}

/** Normalises a raw MediaPipe result into plain objects. */
export function parseResult(result, width, height) {
  const hands = (result?.landmarks || []).map((landmarks, i) => {
    const cat = result.handedness?.[i]?.[0] || result.handednesses?.[i]?.[0];
    return {
      landmarks: landmarks.map((p) => ({ x: p.x, y: p.y, z: p.z })),
      worldLandmarks: (result.worldLandmarks?.[i] || []).map((p) => ({ x: p.x, y: p.y, z: p.z })),
      handedness: physicalHand(cat?.categoryName),
      handednessScore: cat?.score ?? 0,
    };
  });
  return { hands, width, height };
}

/**
 * Detect hands in a still image (canvas, image element or ImageBitmap).
 * @returns {Promise<{hands: Array, width: number, height: number, durationMs: number}>}
 */
export async function detectHandsInImage(source) {
  const landmarker = await getHandLandmarker('IMAGE');
  const width = source.naturalWidth || source.videoWidth || source.width;
  const height = source.naturalHeight || source.videoHeight || source.height;
  const t0 = performance.now();
  const result = landmarker.detect(source);
  return { ...parseResult(result, width, height), durationMs: performance.now() - t0 };
}

/** Detect hands in the current frame of a playing <video>. */
export async function detectHandsInVideo(video, timestampMs) {
  const landmarker = await getHandLandmarker('VIDEO');
  const result = landmarker.detectForVideo(video, timestampMs);
  return parseResult(result, video.videoWidth, video.videoHeight);
}

/** Picks the most relevant hand: matching the requested side, otherwise the largest. */
export function pickPrimaryHand(hands, preferred) {
  if (!hands.length) return null;
  const area = (h) => {
    const xs = h.landmarks.map((p) => p.x);
    const ys = h.landmarks.map((p) => p.y);
    return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
  };
  const sorted = [...hands].sort((a, b) => area(b) - area(a));
  return sorted.find((h) => h.handedness === preferred) || sorted[0];
}
