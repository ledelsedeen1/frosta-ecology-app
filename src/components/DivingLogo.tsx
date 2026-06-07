import React, { useState } from 'react';

export function DivingLogo({ forceRaw = false, hasWhiteBackground = true }) {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center p-2.5 border border-dashed border-[#278EA5]/30 rounded bg-[#0A2E36]/40 text-center select-none shrink-0">
        <span className="text-[11px] text-[#48C0D8] font-black tracking-tight leading-none">🌊 Diving Ecology Education Frosta</span>
        <span className="text-[8px] text-slate-400 mt-1 max-w-[190px] leading-tight font-normal">
          Official logo file is missing. Upload <code className="bg-black/30 text-[#48C0D8] px-0.5 rounded font-mono">public/logo.png</code> to display.
        </span>
      </div>
    );
  }

  // Exact styling rules: Keep aspect ratio, do not stretch, use object-contain, make responsive
  const imgElement = (
    <img 
      src="/logo.png" 
      alt="Diving Ecology Education Frosta logo" 
      className="w-full h-auto max-h-[75px] object-contain block select-none rounded-sm"
      referrerPolicy="no-referrer"
      onError={() => {
        setHasError(true);
      }} 
    />
  );

  if (hasWhiteBackground && !forceRaw) {
    // If the logo has a white or light background, place it inside a clean white rounded card with padding
    return (
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-center max-w-[195px] w-full shrink-0 select-none">
        {imgElement}
      </div>
    );
  }

  // If the logo has transparent background, place it directly on the app background
  return (
    <div className="flex items-center justify-center max-w-[195px] w-full shrink-0 select-none">
      {imgElement}
    </div>
  );
}
