import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import RouterOutletTab1 from './RouterOutletTab1';
import RouterOutletTab2 from './RouterOutletTab2';
import WrapperIonTabs from './WrapperIonTabs';

/**
 * Matches the main app structure (RouterUniversalis):
 * - WrapperIonTabs receives IonRouterOutlet as children
 * - Routes are defined inline within the outlet
 *
 * This is equivalent to:
 * <Route path="*" element={
 *   <WrapperIonTabs>
 *     <IonRouterOutlet id="tabs-outlet">
 *       <Route path="/tab1/*" ... />
 *       <Route path="/tab2/*" ... />
 *     </IonRouterOutlet>
 *   </WrapperIonTabs>
 * } />
 */
const WrapperIonTabsWithOutlet: React.FC = () => {
  return (
    <WrapperIonTabs>
      <IonRouterOutlet id="tabs-outlet">
        <Route path="/tab1/*" element={<RouterOutletTab1 />} />
        <Route path="/tab2/*" element={<RouterOutletTab2 />} />
      </IonRouterOutlet>
    </WrapperIonTabs>
  );
};

export default WrapperIonTabsWithOutlet;
