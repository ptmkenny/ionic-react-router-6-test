import { Route } from 'react-router-dom';
import {
  IonPage,
  IonRouterOutlet,
} from '@ionic/react';
import Tab2 from './Tab2';

/**
 * Router outlet for Tab 2 - each tab has its own nested IonRouterOutlet.
 */
const RouterOutletTab2: React.FC = () => {
  return (
    <IonPage>
      <IonRouterOutlet id="tab2-outlet">
        <Route index element={<Tab2 />} />
      </IonRouterOutlet>
    </IonPage>
  );
};

export default RouterOutletTab2;
