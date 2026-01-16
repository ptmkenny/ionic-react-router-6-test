import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import RouterOutletOnboarding from './pages/RouterOutletOnboarding';
import RouterOutletTab1 from './pages/RouterOutletTab1';
import RouterOutletTab2 from './pages/RouterOutletTab2';
import WrapperIonTabs from './pages/WrapperIonTabs';

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
 * │   └─ IonPage
 * │       └─ IonRouterOutlet (inner)
 * │           └─ Route verify-email → PageOnboardingVerifyEmail
 * └─ Routes for tabs (tab1/*, tab2/*)
 *     └─ WrapperIonTabs
 *         └─ IonTabs with IonRouterOutlet
 *
 * Navigation from tabs to /onboarding triggers the bug.
 */

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet id="outer-outlet">
        {/* Route with nested IonRouterOutlet inside IonPage */}
        <Route path="/onboarding/*" element={<RouterOutletOnboarding />} />

        {/* Tabs routes - explicit paths */}
        <Route path="/tab1/*" element={<WrapperIonTabs />} />
        <Route path="/tab2/*" element={<WrapperIonTabs />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
