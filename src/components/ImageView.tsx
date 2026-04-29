import React, { useEffect, useRef, useState } from 'react';
import { initFaceLandmarker } from '../lib/vision';
import { applyMakeup } from '../lib/makeup';
import { AppState } from '../types';

interface Props {
  state: AppState;
  showBefore: boolean;
  photoUrl: string;
  onReady: () => void;
}

export default function ImageView({ state, showBefore, photoUrl, onReady }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const landmarkerRef = useRef<any>(null);
  const landmarksRef = useRef<any[] | null>(null);

  // Initialize FaceLandmarker once
  useEffect(() => {
    let active = true;
    initFaceLandmarker()
      .then(lm => {
        if (!active) { lm.close(); return; }
        landmarkerRef.current = lm;
        onReady();
        // If image was already loaded while waiting for landmarker
        if (imgRef.current && imgRef.current.complete) {
          processImage();
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to initialize makeup processor.");
      });
      
    return () => { 
        active = false; 
        if (landmarkerRef.current) {
            landmarkerRef.current.close();
        }
    };
  }, []);

  const processImage = () => {
    if (!landmarkerRef.current || !imgRef.current || !canvasRef.current) return;
    try {
      const img = imgRef.current;
      
      // Reset canvas size to match raw image resolution for pristine quality mapping
      canvasRef.current.width = img.naturalWidth;
      canvasRef.current.height = img.naturalHeight;

      // Make sure width/height exist (in case of very early firing)
      if (img.naturalWidth === 0) return;

      const results = landmarkerRef.current.detect(img);
      
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        landmarksRef.current = results.faceLandmarks[0];
        drawMakeup();
      } else {
        landmarksRef.current = null;
        alert("No face detected in this image. Please upload a clear photo containing a face.");
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    } catch (e) {
      console.error("Detection error:", e);
      setError("Failed to process image.");
    }
  };

  const drawMakeup = () => {
    if (!canvasRef.current || !imgRef.current || !landmarksRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      if (!showBefore) {
        applyMakeup(
          ctx,
          landmarksRef.current,
          canvasRef.current.width,
          canvasRef.current.height,
          state
        );
      }
    }
  };

  // Redraw when state or showBefore changes
  useEffect(() => {
    drawMakeup();
  }, [state, showBefore]);

  if (error) {
    return <div className="w-full h-full flex items-center justify-center p-8 text-center text-red-500 font-medium">{error}</div>;
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
       {/* Use a wrapper that precisely matches internal content boundaries for aligned overlay */}
       <div className="relative inline-block max-w-full max-h-full shadow-lg rounded-xl bg-white overflow-hidden">
         <img
           ref={imgRef}
           crossOrigin="anonymous"
           src={photoUrl}
           className="max-w-full max-h-[85vh] object-contain block"
           onLoad={processImage}
           alt="Subject"
         />
         <canvas
           ref={canvasRef}
           className="absolute top-0 left-0 w-full h-full pointer-events-none"
         />
       </div>
    </div>
  );
}
