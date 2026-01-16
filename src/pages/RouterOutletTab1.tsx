import { Route } from 'react-router-dom';
import {
  IonRouterOutlet,
} from '@ionic/react';
import Tab1 from './Tab1';

/**
 * Router outlet for Tab 1 - each tab has its own nested IonRouterOutlet.
 * Critical: No IonPage wrapper - main app does not wrap nested outlets in IonPage.
 */
const RouterOutletTab1: React.FC = () => {
  return (
    <IonRouterOutlet id="tab1-outlet">
      <Route index element={<Tab1 />} />
    </IonRouterOutlet>
  );
};

export default RouterOutletTab1;
