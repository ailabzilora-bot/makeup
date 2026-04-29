import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export const initFaceLandmarker = async () => {
  // Suppress the informational TFLite/MediaPipe log about CPU delegate
  const originalInfo = console.info;
  const originalLog = console.log;
  const originalWarn = console.warn;
  
  const filterLog = (original: any, ...args: any[]) => {
    const msg = args.join(' ');
    if (msg.includes('Created TensorFlow Lite XNNPACK delegate for CPU')) {
      return;
    }
    original.apply(console, args);
  };

  console.info = (...args: any[]) => filterLog(originalInfo, ...args);
  console.log = (...args: any[]) => filterLog(originalLog, ...args);
  console.warn = (...args: any[]) => filterLog(originalWarn, ...args);

  // Matching the version in package.json (0.10.34) for consistency
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
  );
  
  const landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU"
    },
    outputFaceBlendshapes: false,
    runningMode: "IMAGE",
    numFaces: 1
  });

  // Restore console.info
  console.info = originalInfo;
  
  return landmarker;
};
