import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const Tab1: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>React #185 MRE</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <h2>Start route</h2>
      <p>
        This repo reproduces a React runtime crash introduced by the Ionic test build
        <code> 8.8.1-dev.11774273905.1c3b9598</code>.
      </p>
      <p>
        Use the Content tab or the button below, then open the missing content route.
        On the bad build, the app should crash with React error #185 instead of rendering
        the fallback error page.
      </p>
      <IonButton expand="block" routerLink="/content">
        Go to Content index
      </IonButton>
    </IonContent>
  </IonPage>
);

export default Tab1;
