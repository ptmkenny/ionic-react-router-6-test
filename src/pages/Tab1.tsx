import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import './Tab1.css';

const Tab1: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsModalOpen(false);
      navigate('/onboarding/verify-email');
    }, 2000);
  };

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
          id="open-modal-button"
          expand="block"
          onClick={() => setIsModalOpen(true)}
          style={{ marginTop: '24px' }}
        >
          Open Modal
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
            <li>Click &quot;Open Modal&quot;</li>
            <li>Click the navigate button inside the modal</li>
            <li>Wait 2 seconds for the redirect</li>
            <li>Check the indicator on the next page</li>
            <li>Inspect #outer-outlet for aria-hidden=&quot;true&quot;</li>
          </ol>
        </div>

        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Navigate from Modal</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <p>
              Navigating from inside a modal triggers the aria-hidden bug.
              The modal sets aria-hidden on the router outlet, but it doesn&apos;t
              get cleaned up properly after navigation.
            </p>

            <IonButton
              id="navigate-button"
              expand="block"
              onClick={handleNavigate}
              disabled={isLoading}
              style={{ marginTop: '24px' }}
            >
              {isLoading ? (
                <>
                  <IonSpinner name="crescent" style={{ marginRight: '8px' }} />
                  Redirecting in 2s...
                </>
              ) : (
                'Go to /onboarding/verify-email'
              )}
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
