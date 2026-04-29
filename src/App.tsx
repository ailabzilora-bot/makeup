import React, { useState } from 'react';
import { Settings2, Download, Droplet, Eye, Palette, CheckCircle2, Upload } from 'lucide-react';
import { FEATURES, EYELINER_FUNCTIONS, EYELINER_FINISHES, LIPSTICK_FINISHES, FOUNDATION_FUNCTIONS, FOUNDATION_FINISHES, MAKEUP_FUNCTIONS, MAKEUP_FINISHES, LIPSTICK_COLORS, LIPSTICK_OMBRE_COLORS, EYELINER_COLORS, FOUNDATION_COLORS, MAKEUP_COLORS, EYESHADOW_FUNCTIONS, EYESHADOW_FINISHES, EYESHADOW_COLORS, MASCARA_FINISHES, MASCARA_COLORS, EYEBROWS_FINISHES, EYEBROWS_COLORS, CONCEALER_FINISHES, CONCEALER_COLORS, CONTOUR_FINISHES, CONTOUR_COLORS, BLUSH_FINISHES, BLUSH_COLORS, HIGHLIGHTER_FINISHES, HIGHLIGHTER_COLORS } from './constants';
import { AppState } from './types';
import ImageView from './components/ImageView';

export default function App() {
  const [state, setState] = useState<AppState>({
    feature: 'Lipstick',
    eyelinerFunction: 'Winged',
    eyelinerFinish: 'Satin',
    eyelinerColor: '#000000',
    lipstickFinish: 'Lipstick',
    lipstickColor: '#E10600',
    foundationFunction: 'Full',
    foundationFinish: 'Satin',
    foundationColor: '#C3A58F',
    makeupFunction: 'Temples',
    makeupFinish: 'Satin',
    makeupColor: '#8B0015',
    liplinerFinish: 'Lipstick',
    liplinerColor: '#8B0000',
    eyeshadowFunction: 'Eyelid',
    eyeshadowFinish: 'Matte',
    eyeshadowColor: '#8B5E4A',
    mascaraFinish: 'Matte',
    mascaraColor: '#000000',
    eyebrowsFinish: 'Matte',
    eyebrowsColor: '#8B5A2B',
    concealerFinish: 'Matte',
    concealerColor: '#C7A489',
    contourFinish: 'Matte',
    contourColor: '#B07A61',
    blushFinish: 'Matte',
    blushColor: '#D978A6',
    highlighterFinish: 'Glow',
    highlighterColor: '#F2F2F2',
  });

  const isEye = state.feature === 'Eyeliner';
  const isLip = state.feature === 'Lipstick';
  const isFoundation = state.feature === 'Foundation';
  const isMakeup = state.feature === 'Makeup';
  const isLipliner = state.feature === 'Lipliner';
  const isEyeshadow = state.feature === 'Eyeshadow';
  const isMascara = state.feature === 'Mascara';
  const isEyebrows = state.feature === 'Eyebrows';
  const isConcealer = state.feature === 'Concealer';
  const isContour = state.feature === 'Contour';
  const isBlush = state.feature === 'Blush';
  const isHighlighter = state.feature === 'Highlighter';

  const activeColor = 
    isEye ? state.eyelinerColor : 
    (isLip ? state.lipstickColor : 
    (isFoundation ? state.foundationColor : 
    (isMakeup ? state.makeupColor : 
    (isLipliner ? state.liplinerColor : 
    (isEyeshadow ? state.eyeshadowColor : 
    (isMascara ? state.mascaraColor : 
    (isEyebrows ? state.eyebrowsColor : 
    (isConcealer ? state.concealerColor : 
    (isContour ? state.contourColor : 
    (isBlush ? state.blushColor : 
    (isHighlighter ? state.highlighterColor : '#000')))))))))));

  const setColor = (c: string) => setState(s => {
    if (isEye) return { ...s, eyelinerColor: c };
    if (isLip) return { ...s, lipstickColor: c };
    if (isFoundation) return { ...s, foundationColor: c };
    if (isMakeup) return { ...s, makeupColor: c };
    if (isLipliner) return { ...s, liplinerColor: c };
    if (isEyeshadow) return { ...s, eyeshadowColor: c };
    if (isMascara) return { ...s, mascaraColor: c };
    if (isEyebrows) return { ...s, eyebrowsColor: c };
    if (isConcealer) return { ...s, concealerColor: c };
    if (isContour) return { ...s, contourColor: c };
    if (isBlush) return { ...s, blushColor: c };
    if (isHighlighter) return { ...s, highlighterColor: c };
    return s;
  });

  const [showBefore, setShowBefore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleScreenshot = () => {
    const rootImg = document.querySelector('img');
    const rootCanvas = document.querySelector('canvas');
    if (!rootImg || !rootCanvas) return;
    
    const shotCanvas = document.createElement('canvas');
    shotCanvas.width = rootCanvas.width;
    shotCanvas.height = rootCanvas.height;
    const ctx = shotCanvas.getContext('2d');
    if (!ctx) return;
    
    // Draw the source image
    ctx.drawImage(rootImg, 0, 0, shotCanvas.width, shotCanvas.height);
    // Overlay the makeup canvas
    ctx.drawImage(rootCanvas, 0, 0, shotCanvas.width, shotCanvas.height);
    
    const url = shotCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'makeup-try-on.png';
    a.click();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#FDFBF7] text-[#3D3A35] font-sans overflow-hidden">
        {/* Left: Interactive Editor */}
        <div className="flex-1 relative bg-[#F2ECE4] p-6 lg:p-8 flex flex-col justify-center">
           <div className="w-full h-full rounded-2xl bg-black/5 relative overflow-hidden flex items-center justify-center border-4 border-white shadow-sm">
             
             {!photoUrl ? (
                <div className="flex flex-col items-center">
                   <Upload size={48} className="text-[#D4B499] mb-4 opacity-80" />
                   <h2 className="font-serif text-2xl text-[#3D3A35] mb-2">Upload a Photo</h2>
                   <p className="text-sm text-[#A6998A] mb-8 text-center max-w-sm">
                      Select a clear, front-facing photo to try on makeup looks securely in your browser.
                   </p>
                   <label className="bg-[#3D3A35] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors cursor-pointer shadow-md">
                      Choose Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                   </label>
                </div>
             ) : (
                <ImageView state={state} showBefore={showBefore} photoUrl={photoUrl} onReady={() => setLoading(false)} />
             )}
             
             {/* Top floating controls */}
             <div className="absolute top-4 left-4 flex items-center space-x-2 z-10 bg-white/90 px-4 py-2 rounded-full border border-[#EAE4D9] shadow-sm">
               <div className="w-5 h-5 bg-[#D4B499] rounded-full flex items-center justify-center">
                 <div className="w-2.5 h-2.5 border border-white rounded-sm rotate-45"></div>
               </div>
               <span className="font-serif text-[11px] tracking-wider font-bold uppercase text-[#3D3A35]">Glamour AI Try-On</span>
             </div>

             {photoUrl && (
               <div className="absolute top-4 right-4 z-10">
                 <label className="bg-white/80 backdrop-blur px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors border border-[#EAE4D9] cursor-pointer text-[#3D3A35] shadow-sm">
                    Change Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                 </label>
               </div>
             )}

             {/* Loading Overlay */}
             {(loading && photoUrl) && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#F2ECE4]/80 backdrop-blur-md text-[#3D3A35]">
                   <div className="h-10 w-10 border-2 border-[#D4B499] border-t-transparent rounded-full animate-spin mb-4" />
                   <p className="font-serif text-lg tracking-widest uppercase">Initializing Processing</p>
                </div>
             )}

             {/* Bottom floating controls */}
             {photoUrl && (
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-10">
                   <button 
                     onPointerDown={() => setShowBefore(true)}
                     onPointerUp={() => setShowBefore(false)}
                     onPointerLeave={() => setShowBefore(false)}
                     onTouchStart={() => setShowBefore(true)}
                     onTouchEnd={() => setShowBefore(false)}
                     className="bg-white/80 backdrop-blur px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors border border-[#EAE4D9] select-none"
                   >
                     Before / After
                   </button>
                   <button onClick={handleScreenshot} className="bg-white/80 backdrop-blur p-2.5 rounded-full border border-[#EAE4D9] hover:bg-white transition-colors text-[#3D3A35]" title="Save look">
                     <Download size={18} />
                   </button>
               </div>
             )}
           </div>
        </div>

        {/* Right: Controls Panel */}
        <div className="w-full md:w-[420px] h-full overflow-y-auto bg-white border-l border-[#EAE4D9] flex flex-col z-20">
           <div className="p-8 pb-20 flex flex-col space-y-8 min-h-full">
              <div className="space-y-4">
                 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A6998A]">Beauty Features</h3>
                 
                 {/* Features List */}
                 <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setState(s => ({
                          ...s,
                          feature: 'Lipstick',
                          eyelinerColor: 'transparent',
                          lipstickColor: 'transparent',
                          foundationColor: 'transparent',
                          makeupColor: 'transparent',
                          liplinerColor: 'transparent',
                          eyeshadowColor: 'transparent',
                          mascaraColor: 'transparent',
                          eyebrowsColor: 'transparent',
                          concealerColor: 'transparent',
                          contourColor: 'transparent',
                          blushColor: 'transparent',
                          highlighterColor: 'transparent',
                        }));
                      }}
                      className="py-2 px-1 text-[10px] uppercase tracking-wider rounded-lg transition-all duration-300 border border-[#EAE4D9] hover:border-[#D4B499] text-[#3D3A35]"
                    >
                      Remove All
                    </button>
                    {FEATURES.map(f => (
                       <button
                         key={f}
                         onClick={() => setState(s => ({ ...s, feature: f }))}
                         className={`py-2 px-1 text-[10px] uppercase tracking-wider rounded-lg transition-all duration-300 ${
                           state.feature === f 
                           ? 'border-2 border-[#D4B499] bg-[#FDFBF7] text-[#3D3A35]' 
                           : 'border border-[#EAE4D9] hover:border-[#D4B499] text-[#3D3A35]'
                         }`}
                       >
                         {f}
                       </button>
                    ))}
                 </div>
              </div>

              <div key={state.feature} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both space-y-8">
                {/* Options Base Panel */}
                {!isLipliner && (
                  <div className="space-y-4 bg-[#FDFBF7] p-6 rounded-2xl border border-[#EAE4D9]">
                    <div className="flex justify-between items-end">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#3D3A35]">{state.feature === 'Lipstick' ? 'Function Options' : `${state.feature} Styles`}</h3>
                      <span className="text-[10px] opacity-60 uppercase tracking-tighter text-[#3D3A35]">Precision: High</span>
                    </div>

                    {isEye && (
                      <div className="grid grid-cols-3 gap-2">
                        {EYELINER_FUNCTIONS.map(f => (
                           <button
                             key={f}
                             onClick={() => setState(s => ({ ...s, eyelinerFunction: f }))}
                             className={`py-2 text-[10px] font-semibold border rounded-md transition-all duration-200 ${
                               state.eyelinerFunction === f
                               ? 'border-[#D4B499] bg-[#D4B499] text-white shadow-sm'
                               : 'border-[#EAE4D9] bg-white text-[#3D3A35] hover:border-[#D4B499]'
                             }`}
                           >
                             {f}
                           </button>
                        ))}
                      </div>
                    )}

                    {isFoundation && (
                      <div className="grid grid-cols-2 gap-2">
                        {FOUNDATION_FUNCTIONS.map(f => (
                           <button
                             key={f}
                             onClick={() => setState(s => ({ ...s, foundationFunction: f }))}
                             className={`py-2 text-[10px] font-semibold border rounded-md transition-all duration-200 ${
                               state.foundationFunction === f
                               ? 'border-[#D4B499] bg-[#D4B499] text-white shadow-sm'
                               : 'border-[#EAE4D9] bg-white text-[#3D3A35] hover:border-[#D4B499]'
                             }`}
                           >
                             {f}
                           </button>
                        ))}
                      </div>
                    )}

                    {isMakeup && (
                      <div className="grid grid-cols-3 gap-2">
                        {MAKEUP_FUNCTIONS.map(f => (
                           <button
                             key={f}
                             onClick={() => setState(s => ({ ...s, makeupFunction: f }))}
                             className={`py-2 text-[10px] font-semibold border rounded-md transition-all duration-200 ${
                               state.makeupFunction === f
                               ? 'border-[#D4B499] bg-[#D4B499] text-white shadow-sm'
                               : 'border-[#EAE4D9] bg-white text-[#3D3A35] hover:border-[#D4B499]'
                             }`}
                           >
                             {f}
                           </button>
                        ))}
                      </div>
                    )}

                    {isEyeshadow && (
                      <div className="grid grid-cols-3 gap-2">
                        {EYESHADOW_FUNCTIONS.map(f => (
                           <button
                             key={f}
                             onClick={() => setState(s => ({ ...s, eyeshadowFunction: f }))}
                             className={`py-2 text-[10px] font-semibold border rounded-md transition-all duration-200 ${
                               state.eyeshadowFunction === f
                               ? 'border-[#D4B499] bg-[#D4B499] text-white shadow-sm'
                               : 'border-[#EAE4D9] bg-white text-[#3D3A35] hover:border-[#D4B499]'
                             }`}
                           >
                             {f}
                           </button>
                        ))}
                      </div>
                    )}

                    {/* Finish Options (Inline Style) */}
                    {!(isFoundation || isLipliner || isEyebrows || isEyeshadow) && (
                      <div className={`pt-4 flex items-center ${isLip ? 'justify-center mx-auto' : 'space-x-4'}`}>
                        {!isLip && (
                          <span className="text-[10px] uppercase tracking-widest font-bold w-12 text-[#3D3A35]">Finish</span>
                        )}
                        <div className="flex bg-white rounded-full p-1 border border-[#EAE4D9] w-full max-w-sm">
                          {(isEye ? EYELINER_FINISHES : (isLip || isLipliner ? LIPSTICK_FINISHES : (isFoundation ? FOUNDATION_FINISHES : (isEyeshadow ? EYESHADOW_FINISHES : (isMascara ? MASCARA_FINISHES : (isEyebrows ? EYEBROWS_FINISHES : (isConcealer ? CONCEALER_FINISHES : (isContour ? CONTOUR_FINISHES : (isBlush ? BLUSH_FINISHES : (isHighlighter ? HIGHLIGHTER_FINISHES : MAKEUP_FINISHES)))))))))).map(f => {
                             const currentFinish = 
                                isEye ? state.eyelinerFinish : 
                                (isLip ? state.lipstickFinish : 
                                (isFoundation ? state.foundationFinish : 
                                (isMakeup ? state.makeupFinish : 
                                (isEyeshadow ? state.eyeshadowFinish : 
                                (isMascara ? state.mascaraFinish : 
                                (isEyebrows ? state.eyebrowsFinish : 
                                (isConcealer ? state.concealerFinish : 
                                (isContour ? state.contourFinish : 
                                (isBlush ? state.blushFinish : 
                                (isHighlighter ? state.highlighterFinish : state.liplinerFinish))))))))));
                             
                             const setFinish = () => setState(s => {
                                if (isEye) return { ...s, eyelinerFinish: f };
                                if (isLip) return { ...s, lipstickFinish: f };
                                if (isFoundation) return { ...s, foundationFinish: f };
                                if (isMakeup) return { ...s, makeupFinish: f };
                                if (isLipliner) return { ...s, liplinerFinish: f };
                                if (isEyeshadow) return { ...s, eyeshadowFinish: f };
                                if (isMascara) return { ...s, mascaraFinish: f };
                                if (isEyebrows) return { ...s, eyebrowsFinish: f };
                                if (isConcealer) return { ...s, concealerFinish: f };
                                if (isContour) return { ...s, contourFinish: f };
                                if (isBlush) return { ...s, blushFinish: f };
                                if (isHighlighter) return { ...s, highlighterFinish: f };
                                return s;
                             });
    
                             return (
                               <button
                                 key={f}
                                 onClick={setFinish}
                                 className={`flex-1 py-1 rounded-full text-[9px] uppercase font-bold transition-all duration-300 ${
                                   currentFinish === f
                                   ? 'bg-[#D4B499] text-white'
                                   : 'text-[#A6998A] hover:text-[#3D3A35]'
                                 }`}
                               >
                                 {f}
                               </button>
                             );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Color Palette */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A6998A]">Color Palette</h3>
                    <span className="text-[10px] font-medium text-[#3D3A35] opacity-50">
                      {(() => {
                        if (activeColor === 'transparent') return 'No Color';
                        const colors = isFoundation ? FOUNDATION_COLORS : (isMakeup ? MAKEUP_COLORS : (isLip || isLipliner ? (state[isLip ? 'lipstickFinish' : 'liplinerFinish'] === 'Lipstick Ombre' ? LIPSTICK_OMBRE_COLORS : LIPSTICK_COLORS) : (isEyeshadow ? EYESHADOW_COLORS : (isMascara ? MASCARA_COLORS : (isEyebrows ? EYEBROWS_COLORS : (isConcealer ? CONCEALER_COLORS : (isContour ? CONTOUR_COLORS : (isBlush ? BLUSH_COLORS : (isHighlighter ? HIGHLIGHTER_COLORS : EYELINER_COLORS)))))))));
                        const active = colors.find(c => c.hex === activeColor);
                        return active ? active.name : '';
                      })()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setColor('transparent')}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm outline-none transition-all duration-200 ${
                          activeColor === 'transparent' ? 'ring-2 ring-offset-2 ring-black scale-110 border-transparent' : 'border border-[#EAE4D9] hover:scale-110 bg-white'
                        }`}
                        title="No Color"
                    >
                        <div className="w-[2px] h-8 bg-red-500 rotate-45 transform"></div>
                    </button>
                    {(isFoundation ? FOUNDATION_COLORS : (isMakeup ? MAKEUP_COLORS : (isLip || isLipliner ? (state[isLip ? 'lipstickFinish' : 'liplinerFinish'] === 'Lipstick Ombre' ? LIPSTICK_OMBRE_COLORS : LIPSTICK_COLORS) : (isEyeshadow ? EYESHADOW_COLORS : (isMascara ? MASCARA_COLORS : (isEyebrows ? EYEBROWS_COLORS : (isConcealer ? CONCEALER_COLORS : (isContour ? CONTOUR_COLORS : (isBlush ? BLUSH_COLORS : (isHighlighter ? HIGHLIGHTER_COLORS : EYELINER_COLORS)))))))))).map(c => (
                       <button
                         key={c.name}
                         onClick={() => setColor(c.hex)}
                         className={`w-10 h-10 rounded-full transition-transform duration-300 flex items-center justify-center ${
                           activeColor === c.hex 
                           ? 'ring-2 ring-offset-2 ring-[#D4B499]' 
                           : 'hover:scale-110'
                         } ${c.name === 'White' || c.name === 'Snow white' ? 'border border-[#EAE4D9]' : ''}`}
                         style={{ background: (c as any).gradient || c.hex }}
                         title={c.name}
                       >
                       </button>
                    ))}
                  </div>
                </div>


              </div>
           </div>
        </div>
    </div>
  );
}
