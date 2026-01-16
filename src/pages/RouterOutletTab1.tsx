import { Route } from 'react-router-dom';
import {
  IonPage,
  IonRouterOutlet,
} from '@ionic/react';
import Tab1 from './Tab1';

/**
 * Router outlet for Tab 1 - each tab has its own nested IonRouterOutlet.
 * This matches the original structure where tabs have their own outlets.
 */
const RouterOutletTab1: React.FC = () => {
  return (
    <IonPage>
      <IonRouterOutlet id="tab1-outlet">
        <Route index element={<Tab1 />} />
      </IonRouterOutlet>
    </IonPage>
  );
};

export default RouterOutletTab1;
