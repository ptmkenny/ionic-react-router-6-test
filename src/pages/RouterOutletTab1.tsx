import { IonContent, IonPage, IonRouterOutlet } from '@ionic/react';
import './Tab1.css';
import Tab1 from './Tab1';
import { Route } from 'react-router';

const RouterOutletTab1: React.FC = () => {
  console.log('loaded RouterOutletTab1');
  return (
    <IonPage>
      <IonRouterOutlet>
        <Route index element={<Tab1 />} />
        <Route
          path="abc"
          element={
            <IonPage>
              <IonContent>
                <p>ABC</p>
              </IonContent>
            </IonPage>
          }
        />
      </IonRouterOutlet>
    </IonPage>
  );
};

export default RouterOutletTab1;
