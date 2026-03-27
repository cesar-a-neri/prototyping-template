import React from 'react';
import { NavV3, ShowIconsContext, ShowDescriptionsContext } from './SgpNav';
import { useTweakpane } from '@/lib/tweakpane';

// ─── Main Prototype ───────────────────────────────────────────────────────────

const SGPNavPrototype: React.FC = () => {
  const { params } = useTweakpane({
    appPickerInBranding: false,
    showIcons: true,
    showDescriptions: true,
  });

  return (
    <ShowIconsContext.Provider value={params.showIcons as boolean}>
      <ShowDescriptionsContext.Provider value={params.showDescriptions as boolean}>
        <div className="min-h-screen bg-gray-2 flex flex-col">
          <div className="shadow-sm">
            <NavV3 appPickerInBranding={params.appPickerInBranding as boolean} />
          </div>
        </div>
      </ShowDescriptionsContext.Provider>
    </ShowIconsContext.Provider>
  );
};

export const title = 'SGP Navigation IA';
export const route = '/sgp-nav';

export default SGPNavPrototype;
