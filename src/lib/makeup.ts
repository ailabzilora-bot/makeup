import { AppState } from "../types";

const RIGHT_EYE_UPPER = [33, 246, 161, 160, 159, 158, 157, 173, 133];
const RIGHT_EYE_LOWER = [33, 7, 163, 144, 145, 153, 154, 155, 133];
const LEFT_EYE_UPPER = [362, 398, 384, 385, 386, 387, 388, 466, 263];
const LEFT_EYE_LOWER = [362, 382, 381, 380, 374, 373, 390, 249, 263];

const UPPER_LIP_OUTER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291];
const UPPER_LIP_INNER = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308];
const LOWER_LIP_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308];
const LOWER_LIP_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

const FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
const T_ZONE = [
  // Forehead top bar (left to right)
  109, 67, 103, 54, 21, 10, 338, 251, 284, 332, 297, 338,
  // Forehead bottom boundary for T-bar
  337, 298, 333, 299, 151, 69, 104, 108, 109,
  // Vertical stem
  151, 9, 8, 168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 164, 400, 378, 152, 148, 176, 149, 150, 164, 2, 94, 19
]; 

const LEFT_EYEBROW = [46, 53, 52, 65, 55, 70, 63, 105, 66, 107, 46];
const RIGHT_EYEBROW = [276, 283, 282, 295, 285, 300, 293, 334, 296, 336, 276];

const LEFT_UNDER_EYE = [373, 374, 380, 381, 382, 390, 249];
const RIGHT_UNDER_EYE = [144, 145, 153, 154, 155, 163, 7];

const LEFT_TEMPLE = [21, 54, 103, 67, 209, 10, 151, 500, 21]; // Approx indices for left side forehead/hairline
const RIGHT_TEMPLE = [251, 332, 297, 338, 10, 151, 338, 251]; // Approx indices for right side forehead/hairline

// Better defined forehead
const FOREHEAD_TOP = [10, 338, 297, 332, 284, 251, 21, 162, 127, 234, 93];

export const applyMakeup = (
  ctx: CanvasRenderingContext2D,
  landmarks: any[],
  width: number,
  height: number,
  state: AppState
) => {
  const getPoint = (idx: number) => ({
    x: landmarks[idx].x * width,
    y: landmarks[idx].y * height
  });

  // --- ARTISTIC MAKEUP ---
  if (state.feature === 'Makeup' && state.makeupColor !== 'transparent') {
    ctx.save();
    const alpha = 0.22;
    const mode = state.makeupFunction;

    ctx.beginPath();
    if (mode === 'Forehead') {
        // Forehead: Glabella flaring out to Middle brows
        const patch = [
            197, // Bottom center
            52, 65, 55, 107, 66, // Left middle to inner brow
            9,   // Top center
            296, 336, 285, 295, 282, // Right inner to middle brow
            197  // Close
        ];
        ctx.moveTo(getPoint(patch[0]).x, getPoint(patch[0]).y);
        patch.forEach(i => ctx.lineTo(getPoint(i).x, getPoint(i).y));
        ctx.closePath();
    } else if (mode === 'Temples') {
        // Temples: Area spans from the outer eyebrows down to the pointy part of the eyelashes (outer eye corner)
        
        // Subject Left (Viewer's Right)
        // Upper edge: outer eyebrow (283, 276). Lateral: 389->356->454. Lower bound ends horizontally at outer eye corner (359->263).
        const lTemple = [263, 256, 283, 276, 389, 356, 454, 359, 263];
        ctx.moveTo(getPoint(lTemple[0]).x, getPoint(lTemple[0]).y);
        lTemple.forEach(i => ctx.lineTo(getPoint(i).x, getPoint(i).y));
        ctx.closePath();

        // Subject Right (Viewer's Left)
        // Upper edge: outer eyebrow (53, 46). Lateral: 162->127->234. Lower bound ends horizontally at outer eye corner (130->33).
        const rTemple = [33, 27, 53, 46, 162, 127, 234, 130, 33];
        ctx.moveTo(getPoint(rTemple[0]).x, getPoint(rTemple[0]).y);
        rTemple.forEach(i => ctx.lineTo(getPoint(i).x, getPoint(i).y));
        ctx.closePath();
    } else if (mode === 'One Side') {
        // Viewer's right: Forehead area above one eyebrow, starting near center and curving out
        // Includes the small area down the side of the nose and the inner eye corner
        // Keeps only the inner, vertical portion, avoiding the eye contour itself to prevent color blending into the eye
        const patch = [197, 334, 296, 336, 285];
        ctx.moveTo(getPoint(patch[0]).x, getPoint(patch[0]).y);
        patch.forEach(i => ctx.lineTo(getPoint(i).x, getPoint(i).y));
        
        const innerBottom = getPoint(197);
        const midBrow = getPoint(285);
        
        // Create an upward curve over the forehead, starting from mid brow
        // sweeping back down to the inner eye socket area
        const cpX = midBrow.x + (innerBottom.x - midBrow.x) * 0.5;
        const cpY = midBrow.y - Math.abs(innerBottom.x - midBrow.x) * 1.5;
        
        ctx.quadraticCurveTo(cpX, cpY, innerBottom.x, innerBottom.y);
        
        ctx.closePath();
    }

    // Calculate alpha exactly like Eyeshadow
    let currentAlpha = 0.22;
    currentAlpha *= 0.6; // Matches eyeshadow's alpha multiplier
    
    ctx.globalAlpha = currentAlpha;

    if (state.makeupFinish === 'Satin') {
        ctx.globalCompositeOperation = 'source-over';
    } else {
        // Matte
        ctx.globalCompositeOperation = 'multiply';
    }

    ctx.fillStyle = state.makeupColor;
    ctx.filter = `blur(${Math.max(12, width * 0.03)}px)`;
    ctx.fill();

    ctx.filter = 'none';

    ctx.restore();
  }

  // --- FOUNDATION ---
  if (state.foundationColor !== 'transparent') {
    ctx.save();
    
    const alpha = 0.22;
    const isTZone = state.foundationFunction === 'T-Zone';
    
    if (isTZone) {
      // 1. T-Zone implementation: T-Shape highlight
      const verticalLine = [9, 8, 168, 6, 197, 195, 5, 4, 1, 2];
      
      const drawMain = () => {
          ctx.beginPath();
          verticalLine.forEach((idx, i) => {
              let p = getPoint(idx);
              if (i === 0) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
          });
          
          // Horizontal bar of the T-Shape
          const leftPoint = getPoint(105); // Above left brow apex
          const rightPoint = getPoint(334); // Above right brow apex
          const centerPoint = getPoint(9); // Top of the vertical line
          
          ctx.moveTo(leftPoint.x, centerPoint.y - height * 0.01);
          ctx.quadraticCurveTo(centerPoint.x, centerPoint.y + height * 0.01, rightPoint.x, centerPoint.y - height * 0.01);
          ctx.stroke();
      };
      
      const drawMouth = () => {
          ctx.beginPath();
          const noseBase = getPoint(2);
          const mouthLeft = getPoint(61);
          const mouthRight = getPoint(291);
          const mouthBottom = getPoint(17);
          
          // Curve left side of the mouth
          ctx.moveTo(noseBase.x, noseBase.y);
          ctx.quadraticCurveTo(
              mouthLeft.x - width * 0.03, noseBase.y + height * 0.01, 
              mouthLeft.x - width * 0.02, mouthLeft.y
          );
          ctx.quadraticCurveTo(
              mouthLeft.x - width * 0.01, mouthBottom.y + height * 0.01, 
              mouthLeft.x + width * 0.05, mouthBottom.y + height * 0.01
          );
          
          // Curve right side of the mouth
          ctx.moveTo(noseBase.x, noseBase.y);
          ctx.quadraticCurveTo(
              mouthRight.x + width * 0.03, noseBase.y + height * 0.01, 
              mouthRight.x + width * 0.02, mouthRight.y
          );
          ctx.quadraticCurveTo(
              mouthRight.x + width * 0.01, mouthBottom.y + height * 0.01, 
              mouthRight.x - width * 0.05, mouthBottom.y + height * 0.01
          );
          ctx.stroke();
      };
      
      ctx.strokeStyle = state.foundationColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'overlay';
      
      // Widest, softest layer
      ctx.filter = `blur(${Math.max(18, width * 0.05)}px)`;
      ctx.globalAlpha = alpha * 0.4;
      ctx.lineWidth = width * 0.12;
      drawMain();
      ctx.lineWidth = width * 0.06; // Thinner around mouth
      drawMouth();

      // Mid layer
      ctx.filter = `blur(${Math.max(10, width * 0.025)}px)`;
      ctx.globalAlpha = alpha * 0.6;
      ctx.lineWidth = width * 0.06;
      drawMain();
      ctx.lineWidth = width * 0.03; // Thinner around mouth
      drawMouth();

      // Core intensive layer
      ctx.filter = `blur(${Math.max(5, width * 0.012)}px)`;
      ctx.globalAlpha = alpha * 0.9;
      ctx.lineWidth = width * 0.02;
      drawMain();
      ctx.lineWidth = width * 0.01; // Thinner around mouth
      drawMouth();
      
      ctx.filter = 'none';

      // Punch out the eyes and lips just in case it bleeds
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1.0;
      
      const punchOut = (indices: number[]) => {
          ctx.beginPath();
          ctx.moveTo(getPoint(indices[0]).x, getPoint(indices[0]).y);
          for(let i=1; i<indices.length; i++) {
              let p = getPoint(indices[i]);
              ctx.lineTo(p.x, p.y);
          }
          ctx.closePath();
          ctx.fill();
      };

      punchOut(RIGHT_EYE_UPPER.concat(RIGHT_EYE_LOWER.reverse()));
      punchOut(LEFT_EYE_UPPER.concat(LEFT_EYE_LOWER.reverse()));
      punchOut(UPPER_LIP_OUTER.concat(LOWER_LIP_OUTER.reverse()));

      ctx.restore();
    } else {
      // 2. Full Face implementation
      // Create face mask
      ctx.beginPath();
      const indices = FACE_OVAL;
      
      // Top row indices that need to be pushed up for full hairline coverage
      const foreheadTopIndices = [10, 338, 297, 332, 284, 251, 21, 54, 103, 67, 109];

      indices.forEach((idx, i) => {
          let p = getPoint(idx);
          // Significantly nudge top forehead landmarks up to ensure full coverage up to the hair
          if (foreheadTopIndices.includes(idx)) {
              p.y -= height * 0.06; 
          }
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      
      // Use clip to restrict effect
      ctx.clip();

      // 1. Foundation Base Color (Overlay)
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = state.foundationColor;
      ctx.globalCompositeOperation = 'overlay';
      ctx.fill();

      // 2. Skin Smoothing (Blur)
      ctx.globalAlpha = alpha * 0.2;
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fill();

      // 4. Punch out eyes and lips to preserve detail
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1.0;
      
      const punchOut = (indices: number[]) => {
          ctx.beginPath();
          ctx.moveTo(getPoint(indices[0]).x, getPoint(indices[0]).y);
          for(let i=1; i<indices.length; i++) {
              let p = getPoint(indices[i]);
              ctx.lineTo(p.x, p.y);
          }
          ctx.closePath();
          ctx.fill();
      };

      punchOut(RIGHT_EYE_UPPER.concat(RIGHT_EYE_LOWER.reverse()));
      punchOut(LEFT_EYE_UPPER.concat(LEFT_EYE_LOWER.reverse()));
      punchOut(UPPER_LIP_OUTER.concat(LOWER_LIP_OUTER.reverse()));
      // Foundation should cover the brow area for a natural look, so we don't punch them out anymore

      ctx.restore();
    }
  }

  // --- EYESHADOW ---
  if (state.eyeshadowColor !== 'transparent') {
    ctx.save();
    let alpha = 0.55; // Increased intensity
    
    if (state.eyeshadowFunction === 'Eyebrow Line') {
        ctx.globalCompositeOperation = 'source-over'; // Solid line
    } else if (state.eyeshadowFinish === 'Shimmer') {
        ctx.globalCompositeOperation = 'screen';
        alpha *= 1.2;
    } else if (state.eyeshadowFinish === 'Satin') {
        ctx.globalCompositeOperation = 'source-over';
    } else {
        // Matte
        ctx.globalCompositeOperation = 'multiply';
    }

    ctx.globalAlpha = alpha;

    ctx.fillStyle = state.eyeshadowColor;
    ctx.strokeStyle = state.eyeshadowColor;
    
    if (state.eyeshadowFunction === 'Eyebrow Line') {
      ctx.filter = 'blur(0.5px)';
      ctx.globalAlpha = Math.min(1.0, alpha * 2.0);
    } else {
      ctx.filter = 'blur(6px)';
    }

    if (state.eyeshadowFunction === 'Eyelid') {
      // We create a polygon that spans from the upper eyelid, extending slightly upwards.
      // Instead of precise eyebrow matching which can be disjointed, we duplicate the upper
      // eyelid line but shifted UP by a few pixels, and fill the space between.
      const drawShadowRegion = (upperEye: number[], offsetX: number, offsetY: number) => {
          ctx.beginPath();
          // Base: along the upper eye lid
          ctx.moveTo(getPoint(upperEye[0]).x, getPoint(upperEye[0]).y);
          for(let i=1; i<upperEye.length; i++) {
              ctx.lineTo(getPoint(upperEye[i]).x, getPoint(upperEye[i]).y);
          }
          // Top: along the upper eyelid but shifted up
          for(let i=upperEye.length-1; i>=0; i--) {
              ctx.lineTo(getPoint(upperEye[i]).x + offsetX, getPoint(upperEye[i]).y + offsetY);
          }
          ctx.closePath();
          ctx.fill();
      };

      // Draw Right Eye Shadow (viewer's left)
      drawShadowRegion(RIGHT_EYE_UPPER, 0, -height * 0.025);
      
      // Draw Left Eye Shadow (viewer's right)
      drawShadowRegion(LEFT_EYE_UPPER, 0, -height * 0.025);
    } else if (state.eyeshadowFunction === 'Contour') {
      const drawContourRegion = (upperEye: number[], offsetY1: number, offsetY2: number) => {
          ctx.beginPath();
          // Base: shifted up by offsetY1
          ctx.moveTo(getPoint(upperEye[0]).x, getPoint(upperEye[0]).y + offsetY1);
          for(let i=1; i<upperEye.length; i++) {
              ctx.lineTo(getPoint(upperEye[i]).x, getPoint(upperEye[i]).y + offsetY1);
          }
          // Top: shifted up by offsetY2
          for(let i=upperEye.length-1; i>=0; i--) {
              ctx.lineTo(getPoint(upperEye[i]).x, getPoint(upperEye[i]).y + offsetY2);
          }
          ctx.closePath();
          ctx.fill();
      };

      // Draw Right Eye Contour (viewer's left)
      drawContourRegion(RIGHT_EYE_UPPER, -height * 0.015, -height * 0.035);
      
      // Draw Left Eye Contour (viewer's right)
      drawContourRegion(LEFT_EYE_UPPER, -height * 0.015, -height * 0.035);
    } else if (state.eyeshadowFunction === 'Highlight') {
      const drawHighlightRegion = (indices: number[]) => {
          ctx.beginPath();
          indices.forEach((idx, i) => {
              const p = getPoint(idx);
              if (i === 0) {
                  ctx.moveTo(p.x, p.y + height * 0.003);
              } else {
                  ctx.lineTo(p.x, p.y + height * 0.003);
              }
          });
          
          // curve back slightly lower
          [...indices].reverse().forEach(idx => {
              const p = getPoint(idx);
              ctx.lineTo(p.x, p.y + height * 0.015);
          });
          
          ctx.closePath();
          ctx.fill();
      };

      // Right eye (viewer's left) from arch to tail
      drawHighlightRegion([295, 282, 283, 276]);

      // Left eye (viewer's right) from arch to tail
      drawHighlightRegion([65, 52, 53, 46]);
    } else if (state.eyeshadowFunction === 'Smokey') {
      const drawRegion = (eye: number[], offsetY1: number, offsetY2: number) => {
          ctx.beginPath();
          ctx.moveTo(getPoint(eye[0]).x, getPoint(eye[0]).y + offsetY1);
          for(let i=1; i<eye.length; i++) {
              ctx.lineTo(getPoint(eye[i]).x, getPoint(eye[i]).y + offsetY1);
          }
          for(let i=eye.length-1; i>=0; i--) {
              ctx.lineTo(getPoint(eye[i]).x, getPoint(eye[i]).y + offsetY2);
          }
          ctx.closePath();
          ctx.fill();
      };

      // Upper contour part
      drawRegion(RIGHT_EYE_UPPER, -height * 0.015, -height * 0.035);
      drawRegion(LEFT_EYE_UPPER, -height * 0.015, -height * 0.035);

      // Part just below bottom of the eye
      drawRegion(RIGHT_EYE_LOWER, height * 0.002, height * 0.010);
      drawRegion(LEFT_EYE_LOWER, height * 0.002, height * 0.010);
    } else if (state.eyeshadowFunction === 'Eyebrow Line') {
      const drawEyebrowLine = (indices: number[]) => {
          ctx.beginPath();
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          
          const pts = indices.map(idx => {
              const p = getPoint(idx);
              return { x: p.x, y: p.y + height * 0.015 };
          });

          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length - 1; i++) {
              const xc = (pts[i].x + pts[i + 1].x) / 2;
              const yc = (pts[i].y + pts[i + 1].y) / 2;
              ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
          }
          ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
          
          ctx.lineWidth = width * 0.0005; // Even thinner line
          ctx.stroke();
      };

      // Right eye (viewer's left), tail to middle
      drawEyebrowLine([276, 283, 282, 295]);

      // Left eye (viewer's right), tail to middle
      drawEyebrowLine([46, 53, 52, 65]);
    }

    // Punch out the eyes just in case the blur bleeds down into the eye white
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 1.0;
    ctx.filter = 'none';
    
    const punchOut = (indices: number[]) => {
        ctx.beginPath();
        ctx.moveTo(getPoint(indices[0]).x, getPoint(indices[0]).y);
        for(let i=1; i<indices.length; i++) {
            let p = getPoint(indices[i]);
            ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.fill();
    };

    punchOut(RIGHT_EYE_UPPER.concat(RIGHT_EYE_LOWER.reverse()));
    punchOut(LEFT_EYE_UPPER.concat(LEFT_EYE_LOWER.reverse()));

    ctx.restore();
  }

  // --- EYEBROWS ---
  if (state.eyebrowsColor !== 'transparent') {
    ctx.save();
    let alpha = 0.22;
    
    // We lightly apply color in the middle
    ctx.globalAlpha = alpha * 0.5; // Light application
    ctx.globalCompositeOperation = 'multiply';
    ctx.filter = 'blur(2px)';
    ctx.fillStyle = state.eyebrowsColor;
    ctx.strokeStyle = state.eyebrowsColor;
    ctx.lineWidth = 1.5;

    const drawBrow = (indices: number[]) => {
      // First pass: light fill for the entire brow shape
      ctx.beginPath();
      ctx.moveTo(getPoint(indices[0]).x, getPoint(indices[0]).y);
      for(let i=1; i<indices.length; i++) {
        ctx.lineTo(getPoint(indices[i]).x, getPoint(indices[i]).y);
      }
      ctx.closePath();
      ctx.fill();

      // Second pass: to make it lightly applied in the middle, we trace a line through the middle of the brow
      // For eyebrows, the middle path is approximately between the upper and lower edges.
      // We will just do a light stroke inside the brow to give it some texture, but keeping it light in the middle.
      // Wait, the instruction says "lightly apply color in the middle".
      // Let's use destination-out to literally make the middle of the brow lighter, giving it a softer look.
    };

    drawBrow(RIGHT_EYEBROW);
    drawBrow(LEFT_EYEBROW);

    // Lighten the middle of the eyebrows to ensure it is lightly applied
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = alpha * 0.3; // Punch out a bit of color
    ctx.filter = 'blur(4px)'; // Large blur for soft center
    
    const punchOutCenter = (indices: number[]) => {
      // Calculate the centroid
      let cx = 0, cy = 0;
      for (const idx of indices) {
        let p = getPoint(idx);
        cx += p.x;
        cy += p.y;
      }
      cx /= indices.length;
      cy /= indices.length;

      // Draw a circle in the middle to punch out color
      ctx.beginPath();
      ctx.arc(cx, cy, height * 0.015, 0, Math.PI * 2);
      ctx.fill();
    };

    punchOutCenter(RIGHT_EYEBROW);
    punchOutCenter(LEFT_EYEBROW);

    ctx.restore();
  }

  // --- CONCEALER ---
  if (state.concealerColor !== 'transparent') {
    ctx.save();
    let alpha = 0.55;
    
    // Light application with transparency
    
    ctx.globalAlpha = alpha;
    
    if (state.concealerFinish === 'Dewy') {
        ctx.globalCompositeOperation = 'screen';
        alpha *= 1.2;
    } else {
        ctx.globalCompositeOperation = 'source-over';
    }

    ctx.fillStyle = state.concealerColor;
    ctx.filter = 'blur(10px)';

    const drawConcealerRegion = (indices: number[], cheekboneIdx: number) => {
        ctx.beginPath();
        // Trace along the lower eye contour
        ctx.moveTo(getPoint(indices[0]).x, getPoint(indices[0]).y);
        for(let i=1; i<indices.length; i++) {
            ctx.lineTo(getPoint(indices[i]).x, getPoint(indices[i]).y);
        }
        
        // Extend downwards to cheekbone
        const cheekbone = getPoint(cheekboneIdx);
        // Extend slightly to create a crescent or triangle shape
        ctx.lineTo(cheekbone.x, cheekbone.y);
        
        // Close path back to start creating a solid region to fill
        ctx.closePath();
        ctx.fill();
    };

    // Right Eye concealer (viewer's left)
    // Cheekbones / Under Eye Area: Landmarks such as 234 (Right) and 454 (Left)
    drawConcealerRegion(RIGHT_UNDER_EYE, 234);
    
    // Left Eye concealer (viewer's right)
    drawConcealerRegion(LEFT_UNDER_EYE, 454);

    // Punch out the eyes again to avoid bleeding into lower eye
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 1.0;
    ctx.filter = 'none';
    
    const punchOut = (indices: number[]) => {
        ctx.beginPath();
        ctx.moveTo(getPoint(indices[0]).x, getPoint(indices[0]).y);
        for(let i=1; i<indices.length; i++) {
            let p = getPoint(indices[i]);
            ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.fill();
    };

    punchOut(RIGHT_EYE_LOWER.concat(RIGHT_EYE_UPPER.reverse()));
    punchOut(LEFT_EYE_LOWER.concat(LEFT_EYE_UPPER.reverse()));

    ctx.restore();
  }

  // --- CONTOUR ---
  if (state.contourColor !== 'transparent') {
    ctx.save();
    let alpha = 0.55;
    
    // Light application with transparency
    ctx.globalAlpha = alpha;
    
    if (state.contourFinish === 'Satin') {
        ctx.globalCompositeOperation = 'soft-light';
    } else {
        ctx.globalCompositeOperation = 'multiply';
    }

    ctx.fillStyle = state.contourColor;
    ctx.strokeStyle = state.contourColor;
    // We want a very spread-out, blended look
    ctx.filter = 'blur(15px)';

    const drawContourTail = (browIdx: number, templeIdx: number) => {
        const browPt = getPoint(browIdx);
        const templePt = getPoint(templeIdx);
        
        ctx.beginPath();
        // Create an oval shape between the end of the eyebrow and the temple
        ctx.ellipse(
           (browPt.x + templePt.x) / 2,
           (browPt.y + templePt.y) / 2,
           height * 0.03, // horizontal radius
           height * 0.015, // vertical radius
           Math.atan2(templePt.y - browPt.y, templePt.x - browPt.x), // rotation
           0, Math.PI * 2
        );
        ctx.fill();
    };

    // Right side of face (viewer's left)
    // 276 is outer right eyebrow, 251 is right temple (approx)
    drawContourTail(276, 251);

    // Left side of face (viewer's right)
    // 46 is outer left eyebrow, 21 is left temple (approx)
    drawContourTail(46, 21);

    ctx.restore();
  }

  // --- BLUSH ---
  if (state.blushColor !== 'transparent') {
    ctx.save();
    let alpha = 0.35;
    
    // "slightly light not really strong light" and "mid level transparency"
    alpha *= 0.6; // mid level transparency
    ctx.globalAlpha = alpha;
    
    // Shimmer gives a softer overlay, Matte applies more color like multiply
    if (state.blushFinish === 'Shimmer') {
        ctx.globalCompositeOperation = 'soft-light';
    } else {
        ctx.globalCompositeOperation = 'multiply';
    }

    ctx.fillStyle = state.blushColor;
    
    // Very soft blur for blush
    ctx.filter = 'blur(18px)';

    const drawBlush = (outerEyeIdx: number, cheekIdx: number, underEyeIdx: number) => {
        const outerEye = getPoint(outerEyeIdx);
        const cheek = getPoint(cheekIdx);
        const underEye = getPoint(underEyeIdx);
        
        ctx.beginPath();
        // Create an oval shape under the outer corners of the eyes
        // Center it roughly slightly below the outer eye corner
        const centerX = (outerEye.x * 2 + cheek.x + underEye.x) / 4;
        const centerY = (outerEye.y + underEye.y * 2 + cheek.y) / 4;
        
        // Apples of cheeks below outer corners
        ctx.ellipse(
           centerX,
           centerY, // Shifting down slightly
           height * 0.04, // horizontal radius (fairly wide)
           height * 0.03, // vertical radius
           Math.atan2(cheek.y - underEye.y, cheek.x - underEye.x), // tilt based on cheekbone
           0, Math.PI * 2
        );
        ctx.fill();
    };

    // Viewer's Left (Right Face):
    // outer eye: 33, cheek edge: 234, under eye: 145 / 154
    drawBlush(33, 234, 154);

    // Viewer's Right (Left Face):
    // outer eye: 263, cheek edge: 454, under eye: 374 / 381
    drawBlush(263, 454, 381);

    ctx.restore();
  }

  // --- HIGHLIGHTER ---
  if (state.highlighterColor !== 'transparent') {
    ctx.save();
    let alpha = 0.35;
    
    // Light application with transparency
    alpha *= 0.7;
    ctx.globalAlpha = alpha;
    
    if (state.highlighterFinish === 'Metallic') {
        ctx.globalCompositeOperation = 'hard-light';
    } else if (state.highlighterFinish === 'Shimmer') {
        ctx.globalCompositeOperation = 'color-dodge';
    } else {
        // Glow
        ctx.globalCompositeOperation = 'screen';
    }

    ctx.fillStyle = state.highlighterColor;
    
    // Soft blur for glowing effect
    ctx.filter = 'blur(12px)';

    const drawHighlighter = (cheekboneIdx: number, templeIdx: number) => {
        const cheek = getPoint(cheekboneIdx);
        const temple = getPoint(templeIdx);
        
        ctx.beginPath();
        
        const centerX = (cheek.x + temple.x) / 2;
        const centerY = (cheek.y + temple.y) / 2;
        
        // Target outer cheeks along cheekbone, closer to the sides
        ctx.ellipse(
           centerX,
           centerY, 
           height * 0.035, // horizontal radius (length)
           height * 0.015, // vertical radius (width)
           Math.atan2(temple.y - cheek.y, temple.x - cheek.x), // angle
           0, Math.PI * 2
        );
        ctx.fill();
    };

    // Right cheek (viewer's left side): outer limit is around 234 / 127
    // Let's sweep from outer eye limit (116) towards temple (117) or upper cheek edge (234)
    drawHighlighter(234, 117);

    // Left cheek (viewer's right side)
    drawHighlighter(454, 346);

    ctx.restore();
  }

  // --- MASCARA ---
  if (state.mascaraColor !== 'transparent') {
    ctx.save();
    let alpha = 0.22;
    
    // Increase alpha slightly for stronger visibility
    alpha = Math.min(1.0, alpha * 1.5);
    ctx.globalAlpha = alpha;
    
    // Glossy makes it darker with a softer glow, Matte is tight and solid
    if (state.mascaraFinish === 'Glossy') {
        ctx.shadowColor = state.mascaraColor;
        ctx.shadowBlur = 4;
        ctx.filter = 'blur(0.5px)';
    } else {
        ctx.filter = 'blur(1px)';
    }

    ctx.strokeStyle = state.mascaraColor;
    ctx.lineWidth = Math.max(3, height * 0.007); // Thicker line for the lash volume
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawLashLine = (indices: number[]) => {
      ctx.beginPath();
      // To simulate eyelashes at the base, we trace the upper lid curve
      const start = getPoint(indices[0]);
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < indices.length; i++) {
          const p = getPoint(indices[i]);
          ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      // We add an extra pass slightly shifted up and outward, tapering at ends
      // to create a "thickened" volume effect without being as solid as eyeliner
      ctx.beginPath();
      for (let i = 0; i < indices.length; i++) {
          const p = getPoint(indices[i]);
          let shiftY = -height * 0.003; 
          // taper thickness at corners
          if (i === 0 || i === indices.length - 1) shiftY *= 0.5;
          if (i === 0) ctx.moveTo(p.x, p.y + shiftY);
          else ctx.lineTo(p.x, p.y + shiftY);
      }
      ctx.lineWidth = ctx.lineWidth * 0.7; // Thinner secondary pass
      ctx.stroke();
    };

    // Make the mascara tightly follow the actual eyelash line
    drawLashLine(RIGHT_EYE_UPPER);
    drawLashLine(LEFT_EYE_UPPER);

    // Minor sweep on outer corner of bottom lashes for balance 
    const drawLowerOuter = (indices: number[]) => {
      ctx.beginPath();
      // Draw outer half of lower lash line
      const midPoint = Math.floor(indices.length / 2);
      ctx.moveTo(getPoint(indices[midPoint]).x, getPoint(indices[midPoint]).y);
      for (let i = midPoint; i < indices.length; i++) {
          ctx.lineTo(getPoint(indices[i]).x, getPoint(indices[i]).y);
      }
      ctx.lineWidth = Math.max(1.5, height * 0.003); // Delicate lower lashes
      ctx.stroke();
    };

    drawLowerOuter(RIGHT_EYE_LOWER);
    drawLowerOuter(LEFT_EYE_LOWER);

    ctx.restore();
  }

  // --- EYELINER ---
  if (state.eyelinerColor !== 'transparent') {
    ctx.save();
    let rootAlpha = 0.22;
    if (state.eyelinerFunction === 'Double Mod') {
      rootAlpha += 0.05; // increase absolute intensity by 5%
    }
    ctx.globalAlpha = rootAlpha;

    // Blending effects for realism
    ctx.filter = 'blur(1.5px)';
    if (state.eyelinerFinish === 'Satin') {
      ctx.shadowColor = state.eyelinerColor;
      ctx.shadowBlur = 4;
      ctx.filter = 'blur(1px)';
    } else {
      ctx.shadowBlur = 0;
    }

    const drawContour = (indices: number[], lineWidth = 3.5) => {
      ctx.beginPath();
      const start = getPoint(indices[0]);
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < indices.length; i++) {
          const p = getPoint(indices[i]);
          ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = state.eyelinerColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    };

    const drawCornerShape = (eye: 'right'|'left', mode: 'winged' | 'retro' | 'box' | 'flick' | 'lowerFlick') => {
      const outerIdx = eye === 'right' ? 33 : 263;
      const innerIdx = eye === 'right' ? 133 : 362;
      const pOuter = getPoint(outerIdx);
      const pInner = getPoint(innerIdx);

      const dx = pOuter.x - pInner.x;
      const dy = pOuter.y - pInner.y;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      const nx = dx / len;
      // Use ny very subtly to match eye tilt
      const ny = dy / len;  

      ctx.fillStyle = state.eyelinerColor;
      ctx.beginPath();
      
      if (mode === 'winged' || mode === 'retro') {
          const isRetro = mode === 'retro';
          const ext = len * (isRetro ? 0.45 : 0.35);
          const lift = len * (isRetro ? 0.25 : 0.15);
          
          const pTip = {
              x: pOuter.x + nx * ext, 
              y: pOuter.y + ny * ext - lift
          };
          
          ctx.moveTo(pOuter.x, pOuter.y);
          ctx.lineTo(pTip.x, pTip.y);
          
          const returnPt = getPoint(eye === 'right' ? (isRetro ? 159 : 160) : (isRetro ? 386 : 385));
          const ctrl = { 
              x: pOuter.x + nx * ext * 0.4, 
              y: pOuter.y - lift * 0.5
          };
          
          ctx.quadraticCurveTo(ctrl.x, ctrl.y, returnPt.x, returnPt.y);
          ctx.lineTo(pOuter.x, pOuter.y);
          ctx.fill();
      } else if (mode === 'box') {
          const ext = len * 0.3;
          const lift = len * 0.1;
          const thickness = len * 0.15;
          
          const p1 = { x: pOuter.x + nx * ext, y: pOuter.y + ny * ext - lift };
          const p2 = { x: pOuter.x + nx * ext * 0.8, y: pOuter.y + ny * ext - lift - thickness };
          const returnPt = getPoint(eye === 'right' ? 160 : 385);
          
          ctx.moveTo(pOuter.x, pOuter.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.quadraticCurveTo(pOuter.x + nx * ext * 0.4, pOuter.y - lift - thickness, returnPt.x, returnPt.y);
          ctx.lineTo(pOuter.x, pOuter.y);
          ctx.fill();
      } else if (mode === 'flick') {
          const ext = len * 0.25;
          const lift = len * 0.1;
          const pTip = { x: pOuter.x + nx * ext, y: pOuter.y + ny * ext - lift };
          ctx.moveTo(pOuter.x, pOuter.y);
          ctx.quadraticCurveTo(pOuter.x + nx * ext * 0.5, pOuter.y, pTip.x, pTip.y);
          ctx.lineTo(pTip.x - nx * len * 0.05, pTip.y + len * 0.05);
          ctx.quadraticCurveTo(pOuter.x + nx * ext * 0.4, pOuter.y + len * 0.03, pOuter.x, pOuter.y + len * 0.02);
          ctx.fill();
      } else if (mode === 'lowerFlick') {
          const lowerOuter = getPoint(eye === 'right' ? 144 : 373); 
          const ext = len * 0.25;
          const pTip = { x: pOuter.x + nx * ext, y: pOuter.y + len * 0.05 };
          ctx.moveTo(lowerOuter.x, lowerOuter.y);
          ctx.quadraticCurveTo(pOuter.x + nx * ext * 0.3, pOuter.y + len*0.05, pTip.x, pTip.y);
          ctx.lineTo(pTip.x - nx * len * 0.02, pTip.y + len * 0.03);
          ctx.quadraticCurveTo(pOuter.x + nx * ext * 0.3, pOuter.y + len*0.08, lowerOuter.x, lowerOuter.y + len * 0.02);
          ctx.fill();
      }
    };

    const drawInnerCorner = (eye: 'right'|'left') => {
      const innerIdx = eye === 'right' ? 133 : 362;
      const upperInnerIdx = eye === 'right' ? 173 : 398;
      const lowerInnerIdx = eye === 'right' ? 155 : 390;
      
      const pInner = getPoint(innerIdx);
      const pUpper = getPoint(upperInnerIdx);
      const pLower = getPoint(lowerInnerIdx);

      const dx = pUpper.x - pLower.x;
      const dy = pUpper.y - pLower.y;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      
      const dirX = eye === 'right' ? -1 : 1;
      const ext = len * 1.2;
      const lift = len * 0.1;

      const pTip = {
          x: pInner.x + dirX * ext,
          y: pInner.y + lift
      };

      ctx.fillStyle = state.eyelinerColor;
      ctx.beginPath();
      ctx.moveTo(pUpper.x, pUpper.y);
      ctx.quadraticCurveTo(pInner.x, pInner.y - len * 0.1, pTip.x, pTip.y);
      ctx.quadraticCurveTo(pInner.x, pInner.y + len * 0.1, pLower.x, pLower.y);
      ctx.lineTo(pInner.x, pInner.y);
      ctx.fill();
    };

    const drawFloatingCrease = (eye: 'right'|'left') => {
      const innerIdx = eye === 'right' ? 133 : 362;
      const outerIdx = eye === 'right' ? 33 : 263;
      const midIdx = eye === 'right' ? 159 : 386;
      const pInner = getPoint(innerIdx);
      const pOuter = getPoint(outerIdx);
      const pMid = getPoint(midIdx);
      const dirX = Math.sign(pOuter.x - pInner.x); 
      const len = Math.abs(pOuter.x - pInner.x);
      
      const start = { x: pInner.x + dirX * len * 0.1, y: pInner.y - len * 0.2 };
      const ctrl = { x: pMid.x, y: pMid.y - len * 0.45 };
      const end = { x: pOuter.x + dirX * len * 0.35, y: pOuter.y - len * 0.25 };
      
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(ctrl.x, ctrl.y, end.x, end.y);
      ctx.strokeStyle = state.eyelinerColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const style = state.eyelinerFunction;
    
    // Core Eyeliner Contours
    if (['Top', 'Both', 'Winged', 'Double Flick', 'Retro', 'Box', 'Double Mod'].includes(style)) {
      drawContour(RIGHT_EYE_UPPER, 3.5);
      drawContour(LEFT_EYE_UPPER, 3.5);
    }

    if (['Bottom', 'Both'].includes(style)) {
      drawContour(RIGHT_EYE_LOWER, 2.5);
      drawContour(LEFT_EYE_LOWER, 2.5);
    }

    // High fidelity Wing Structures
    if (style === 'Winged') {
      drawCornerShape('right', 'winged');
      drawCornerShape('left', 'winged');
    }

    if (style === 'Retro') {
      drawCornerShape('right', 'retro');
      drawCornerShape('left', 'retro');
    }

    if (style === 'Box') {
      drawCornerShape('right', 'box');
      drawCornerShape('left', 'box');
    }

    if (style === 'Double Flick') {
      drawCornerShape('right', 'flick');
      drawCornerShape('left', 'flick');
      drawCornerShape('right', 'lowerFlick');
      drawCornerShape('left', 'lowerFlick');
    }

    if (style === 'Double Mod') {
      drawCornerShape('right', 'winged');
      drawCornerShape('left', 'winged');
      drawFloatingCrease('right');
      drawFloatingCrease('left');
      drawInnerCorner('right');
      drawInnerCorner('left');
    }
    ctx.restore();
  }

  // --- LIPSTICK ---
  if (state.lipstickColor !== 'transparent') {
    ctx.save();
    
    let alpha = 0.22;
    ctx.globalCompositeOperation = 'multiply';
    
    if (state.lipstickFinish === 'Lipstick Ombre') {
       alpha *= 0.6;
    } else if (state.lipstickFinish === 'Petal') {
       ctx.globalCompositeOperation = 'source-over';
       alpha *= 0.6;
    }

    ctx.globalAlpha = alpha;
    ctx.fillStyle = state.lipstickColor;
    ctx.filter = 'blur(2px)';

    const fillPolygon = (indicesOuter: number[], indicesInner: number[]) => {
       ctx.beginPath();
       ctx.moveTo(getPoint(indicesOuter[0]).x, getPoint(indicesOuter[0]).y);
       for(let i=1; i<indicesOuter.length; i++) {
           let p = getPoint(indicesOuter[i]);
           ctx.lineTo(p.x, p.y);
       }
       for(let i=indicesInner.length-1; i>=0; i--) {
           let p = getPoint(indicesInner[i]);
           ctx.lineTo(p.x, p.y);
       }
       ctx.closePath();
       ctx.fill();
    }

    fillPolygon(UPPER_LIP_OUTER, UPPER_LIP_INNER);
    fillPolygon(LOWER_LIP_OUTER, LOWER_LIP_INNER);

    // Optional Gloss Highlights (fake specular)
    if (state.lipstickFinish === 'Petal') {
       ctx.globalCompositeOperation = 'screen';
       ctx.globalAlpha = 0.22 * 0.4;
       ctx.fillStyle = '#ffffff';
       ctx.filter = 'blur(4px)';
       
       ctx.beginPath();
       const lowerMid = getPoint(314); 
       const rightOfMid = getPoint(405);
       ctx.ellipse((lowerMid.x + rightOfMid.x)/2, (lowerMid.y + rightOfMid.y)/2 - 4, 12, 4, 0, 0, Math.PI*2);
       ctx.fill();
    }

    ctx.restore();
  }

  // --- LIPLINER ---
  if (state.liplinerColor !== 'transparent') {
    ctx.save();
    
    let alpha = 0.22;
    
    if (state.liplinerFinish === 'Lipstick Ombre') {
       alpha *= 0.6;
    } else if (state.liplinerFinish === 'Petal') {
       ctx.globalCompositeOperation = 'source-over';
       alpha *= 0.8;
       ctx.filter = 'blur(1.5px)';
    } else {
       ctx.globalCompositeOperation = 'multiply';
       ctx.filter = 'blur(2px)';
    }

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = state.liplinerColor;
    ctx.lineWidth = Math.max(2, width * 0.005); // Responsive thickness, min 2px
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const contour = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
    ctx.beginPath();
    ctx.moveTo(getPoint(contour[0]).x, getPoint(contour[0]).y);
    for(let i=1; i<contour.length; i++) {
        let p = getPoint(contour[i]);
        ctx.lineTo(p.x, p.y);
    }
    // Close the path to connect back to 61
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }
};
