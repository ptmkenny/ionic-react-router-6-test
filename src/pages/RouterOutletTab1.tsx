import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import Tab1 from './Tab1';
import PageReproValidationClassName from './PageReproValidationClassName';

const RouterOutletTab1: React.FC = () => (
  <IonRouterOutlet id="tab1-outlet">
    <Route index element={<Tab1 />} />
    <Route path="validation" element={<PageReproValidationClassName />} />
  </IonRouterOutlet>
);

export default RouterOutletTab1;
