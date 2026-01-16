import { Route } from 'react-router-dom';
import { IonContent, IonPage, IonRouterOutlet } from '@ionic/react';
import Tab1 from './Tab1';
import { Suspense } from 'react';

/**
 * Router outlet for Tab 1 - each tab has its own nested IonRouterOutlet.
 * Critical: No IonPage wrapper - main app does not wrap nested outlets in IonPage.
 */
const RouterOutletTab1: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <IonRouterOutlet id="tab1-outlet">
      <Route index element={<Tab1 />} />
      <Route
        path="hello"
        element={
          <IonPage>
            <IonContent>
              <p>Hello.</p>
            </IonContent>
          </IonPage>
        }
      />
    </IonRouterOutlet>
    </Suspense>
  );
};

export default RouterOutletTab1;
