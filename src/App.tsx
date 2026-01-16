import { Route, Navigate } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import RouterOutletOnboarding from './pages/RouterOutletOnboarding';
import RouterOutletTab1 from './pages/RouterOutletTab1';
import RouterOutletTab2 from './pages/RouterOutletTab2';
import WrapperIonTabsWithOutlet from './pages/WrapperIonTabsWithOutlet';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

/**
 * aria-hidden bug MRE
 *
 * Structure that triggers the bug:
 * IonRouterOutlet (outer - gets aria-hidden="true" stuck)
 * ├─ Route /onboarding/* → RouterOutletOnboarding
 * │   └─ Suspense
 * │       └─ IonRouterOutlet (onboarding-outlet - no IonPage wrapper)
 * │           └─ Route verify-email → PageOnboardingVerifyEmail
 * ├─ Route /tab1/* → WrapperIonTabsWithOutlet
 * │   └─ IonTabs
 * │       └─ IonRouterOutlet (tabs-outlet)
 * │           └─ Route /tab1/* → RouterOutletTab1
 * └─ Route /tab2/* → WrapperIonTabsWithOutlet (same component)
 *
 * Navigation from tabs to /onboarding triggers the bug.
 */

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet id="outer-outlet">
        {/* Route with nested IonRouterOutlet (no IonPage wrapper) */}
        <Route path="/onboarding/*" element={<RouterOutletOnboarding />} />

        {/* Tab routes - WrapperIonTabs with inline outlet */}
        <Route path="/tab1/*" element={<WrapperIonTabsWithOutlet />} />
        <Route path="/tab2/*" element={<WrapperIonTabsWithOutlet />} />
        <Route path="/" element={<Navigate to="/tab1" replace />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
