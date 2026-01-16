import { Navigate, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, triangle } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import RouterOutletOnboarding from './pages/RouterOutletOnboarding';

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
 * └─ Route /tabs/* → IonTabs
 *     └─ IonRouterOutlet (tab outlet)
 *
 * Navigation from /tabs to /onboarding triggers the bug.
 */

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet id="outer-outlet">
        {/* Route with nested IonRouterOutlet inside IonPage */}
        <Route path="/onboarding/*" element={<RouterOutletOnboarding />} />

        {/* Tabs route */}
        <Route
          path="*"
          element={
            <IonTabs>
              <IonRouterOutlet id="tabs-outlet">
                <Route path="tab1" element={<Tab1 />} />
                <Route path="tab2" element={<Tab2 />} />
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="tab1" href="/tabs/tab1">
                  <IonIcon aria-hidden="true" icon={triangle} />
                  <IonLabel>Tab 1</IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab2" href="/tabs/tab2">
                  <IonIcon aria-hidden="true" icon={ellipse} />
                  <IonLabel>Tab 2</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/tabs/tab1" replace />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
