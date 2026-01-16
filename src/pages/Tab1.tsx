import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import './Tab1.css';

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>

        <h2>aria-hidden Bug MRE</h2>
        <p>
          This demonstrates a bug where aria-hidden=&quot;true&quot; gets stuck on
          the outer ion-router-outlet after navigating from tabs to a nested outlet.
        </p>

        <IonButton
          id="navigate-button"
          expand="block"
          routerLink="/onboarding/verify-email"
          style={{ marginTop: '24px' }}
        >
          Go to /onboarding/verify-email
        </IonButton>

        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
          }}
        >
          <strong>Reproduction steps:</strong>
          <ol style={{ marginBottom: 0 }}>
            <li>Click the button above</li>
            <li>Check the indicator on the next page</li>
            <li>Open DevTools and check the console</li>
            <li>Inspect the outer ion-router-outlet element</li>
          </ol>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
