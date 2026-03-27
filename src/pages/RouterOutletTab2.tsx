import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import Tab2 from './Tab2';

const RouterOutletTab2: React.FC = () => (
  <IonRouterOutlet id="tab2-outlet">
    <Route index element={<Tab2 />} />
  </IonRouterOutlet>
);

export default RouterOutletTab2;
