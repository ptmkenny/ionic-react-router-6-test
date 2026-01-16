import { Route } from 'react-router-dom';
import {
  IonRouterOutlet,
} from '@ionic/react';
import Tab2 from './Tab2';

/**
 * Router outlet for Tab 2 - each tab has its own nested IonRouterOutlet.
 * Critical: No IonPage wrapper - main app does not wrap nested outlets in IonPage.
 */
const RouterOutletTab2: React.FC = () => {
  return (
    <IonRouterOutlet id="tab2-outlet">
      <Route index element={<Tab2 />} />
    </IonRouterOutlet>
  );
};

export default RouterOutletTab2;
