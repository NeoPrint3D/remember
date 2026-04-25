import { useEffect, useRef, useCallback } from "react";

interface FaceParallaxOptions {
  smoothing?: number;
  enabled?: boolean;
}

interface FaceRotation {
  yaw: number;
  pitch: number;
  roll: number;
}

interface FaceTrackingState {
  faceRotation: FaceRotation;
  headRotation: FaceRotation;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function useFaceParallax(options: FaceParallaxOptions = {}) {
  const { smoothing = 0.08, enabled = true } = options;

  const rawRef = useRef<FaceTrackingState>({
    faceRotation: { yaw: 0, pitch: 0, roll: 0 },
    headRotation: { yaw: 0, pitch: 0, roll: 0 },
  });

  const smoothedRef = useRef<FaceTrackingState>({
    faceRotation: { yaw: 0, pitch: 0, roll: 0 },
    headRotation: { yaw: 0, pitch: 0, roll: 0 },
  });

  const cleanupRef = useRef<(() => void) | null>(null);

  const getRotation = useCallback((): FaceRotation => {
    return smoothedRef.current.headRotation;
  }, []);

  const getFaceRotation = useCallback((): FaceRotation => {
    return smoothedRef.current.faceRotation;
  }, []);

  const getHeadRotation = useCallback((): FaceRotation => {
    return smoothedRef.current.headRotation;
  }, []);

  useEffect(() => {
    if (!enabled) {
      rawRef.current = {
        faceRotation: { yaw: 0, pitch: 0, roll: 0 },
        headRotation: { yaw: 0, pitch: 0, roll: 0 },
      };
      smoothedRef.current = {
        faceRotation: { yaw: 0, pitch: 0, roll: 0 },
        headRotation: { yaw: 0, pitch: 0, roll: 0 },
      };
      cleanupRef.current?.();
      cleanupRef.current = null;
      return;
    }

    let cancelled = false;

    async function init() {
      const FaceMesh = (window as any).FaceMesh;
      const Camera = (window as any).Camera;

      if (!FaceMesh || !Camera) {
        console.error(
          "[useFaceParallax] MediaPipe globals not found. " +
            "Add these script tags to index.html:\n" +
            '<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js"></script>\n' +
            '<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.js"></script>',
        );
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
        });
      } catch (err) {
        console.error("[useFaceParallax] Camera permission denied:", err);
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const video = document.createElement("video");
      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;
      video.style.cssText =
        "position:fixed;opacity:0;pointer-events:none;top:0;left:0;width:1px;height:1px;";
      document.body.appendChild(video);

      const mesh = new FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
      });

      mesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      mesh.onResults((results: any) => {
        if (!results.multiFaceLandmarks?.length) return;

        const lm = results.multiFaceLandmarks[0];

        const leftEye = lm[33];
        const rightEye = lm[263];
        const nose = lm[1];
        const chin = lm[152];
        const forehead = lm[10];
        const mouthLeft = lm[61];
        const mouthRight = lm[291];

        const eyeCx = (leftEye.x + rightEye.x) * 0.5;
        const eyeCy = (leftEye.y + rightEye.y) * 0.5;
        const mouthCx = (mouthLeft.x + mouthRight.x) * 0.5;
        const mouthCy = (mouthLeft.y + mouthRight.y) * 0.5;

        // Lightweight face-driven rotation
        const faceYaw = clamp(-(nose.x - eyeCx) * 6, -1, 1);
        const faceMidY = (forehead.y + chin.y) * 0.5;
        const facePitch = clamp((nose.y - faceMidY) * 6, -1, 1);
        const faceRoll = clamp(
          Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x),
          -0.6,
          0.6,
        );

        // More "head pose" oriented estimate from facial geometry
        const eyeDx = rightEye.x - leftEye.x;
        const eyeDy = rightEye.y - leftEye.y;
        const eyeDist = Math.hypot(eyeDx, eyeDy) || 1e-6;

        const mouthDx = mouthRight.x - mouthLeft.x;
        const mouthDy = mouthRight.y - mouthLeft.y;
        const mouthDist = Math.hypot(mouthDx, mouthDy) || 1e-6;

        const faceHeight =
          Math.hypot(chin.x - forehead.x, chin.y - forehead.y) || 1e-6;

        // Head yaw: compare nose centeredness between eye and mouth centers
        const upperCenterX = eyeCx;
        const lowerCenterX = mouthCx;
        const headYaw = clamp(
          -((nose.x - (upperCenterX + lowerCenterX) * 0.5) / eyeDist) * 2.2,
          -1,
          1,
        );

        // Head pitch: compare nose height inside the vertical face span
        const upperCenterY = (eyeCy + forehead.y) * 0.5;
        const lowerCenterY = (mouthCy + chin.y) * 0.5;
        const verticalMidY = (upperCenterY + lowerCenterY) * 0.5;
        const headPitch = clamp(
          ((nose.y - verticalMidY) / faceHeight) * 5.0,
          -1,
          1,
        );

        // Head roll: angle of the eye line, normalized
        const headRoll = clamp(Math.atan2(eyeDy, eyeDx) / 0.6, -1, 1);

        rawRef.current = {
          faceRotation: {
            yaw: faceYaw,
            pitch: facePitch,
            roll: faceRoll / 0.6,
          },
          headRotation: {
            yaw: headYaw,
            pitch: headPitch,
            roll: headRoll,
          },
        };
      });

      const cam = new Camera(video, {
        onFrame: async () => {
          await mesh.send({ image: video });

          const raw = rawRef.current;
          const s = smoothedRef.current;

          smoothedRef.current = {
            faceRotation: {
              yaw: lerp(s.faceRotation.yaw, raw.faceRotation.yaw, smoothing),
              pitch: lerp(
                s.faceRotation.pitch,
                raw.faceRotation.pitch,
                smoothing,
              ),
              roll: lerp(s.faceRotation.roll, raw.faceRotation.roll, smoothing),
            },
            headRotation: {
              yaw: lerp(s.headRotation.yaw, raw.headRotation.yaw, smoothing),
              pitch: lerp(
                s.headRotation.pitch,
                raw.headRotation.pitch,
                smoothing,
              ),
              roll: lerp(s.headRotation.roll, raw.headRotation.roll, smoothing),
            },
          };
        },
        width: 320 * 2,
        height: 240 * 2,
      });

      cam.start();

      cleanupRef.current = () => {
        cam.stop();
        mesh.close();
        stream.getTracks().forEach((t) => t.stop());
        video.remove();
      };
    }

    init().catch(console.error);

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [enabled, smoothing]);

  return {
    getRotation,
    getFaceRotation,
    getHeadRotation,
  };
}
