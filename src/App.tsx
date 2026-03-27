import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import RouterOutletContent from './pages/RouterOutletContent';
import RouterOutletTab1 from './pages/RouterOutletTab1';
import RouterOutletTab2 from './pages/RouterOutletTab2';
import WrapperIonTabs from './pages/WrapperIonTabs';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';

import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <IonRouterOutlet id="outer-outlet">
        <Route
          path="*"
          element={
            <WrapperIonTabs>
              <IonRouterOutlet id="tabs-outlet">
                <Route path="/tab1/*" element={<RouterOutletTab1 />} />
                <Route path="/tab2/*" element={<RouterOutletTab2 />} />
                <Route path="/content/*" element={<RouterOutletContent />} />
                <Route index element={<Navigate to="/tab1" replace />} />
              </IonRouterOutlet>
            </WrapperIonTabs>
          }
        />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
