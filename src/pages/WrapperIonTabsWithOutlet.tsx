import { Route, Navigate } from 'react-router-dom';
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { ellipse, triangle } from 'ionicons/icons';
import RouterOutletTab1 from './RouterOutletTab1';
import RouterOutletTab2 from './RouterOutletTab2';

/**
 * Combined tabs wrapper with inline outlet and routes.
 * This matches the main app structure where WrapperIonTabs receives
 * an IonRouterOutlet with routes as children.
 *
 * Critical: The IonRouterOutlet and its Route children must be defined
 * at component render time, not passed through props, for Ionic's router
 * to register them correctly.
 */
const WrapperIonTabsWithOutlet: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet id="tabs-outlet">
        <Route path="/tab1/*" element={<RouterOutletTab1 />} />
        <Route path="/tab2/*" element={<RouterOutletTab2 />} />
        <Route path="/" element={<Navigate to="/tab1" replace />} />
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="tab1" href="/tab1">
          <IonIcon aria-hidden="true" icon={triangle} />
          <IonLabel>Tab 1</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab2" href="/tab2">
          <IonIcon aria-hidden="true" icon={ellipse} />
          <IonLabel>Tab 2</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default WrapperIonTabsWithOutlet;
