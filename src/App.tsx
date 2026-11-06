import { useEffect, useState } from 'react';
import { Navigate, Route } from 'react-router-dom';
import {
  IonApp,
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  setupIonicReact,
  useIonRouter,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

// iOS mode enables swipeGesture on the root outlet, which is what triggers the bug.
// Open with ?mode=md to compare: in md mode the same steps work.
setupIonicReact({ mode: new URLSearchParams(window.location.search).get('mode') === 'md' ? 'md' : 'ios' });

// Each page gets its own background so the page on screen is obvious at a glance.
const pageColors = { step1: '#b7e4c7', step2: '#f4a6a6', home: '#a9cbf5', settings: '#e0d1f5' };
const background = (color: string) => ({ '--background': color }) as React.CSSProperties;

const Step: React.FC<{ step: 1 | 2; next: string; label: string }> = ({ step, next, label }) => {
  const router = useIonRouter();
  return (
    <IonPage data-testid={`step-${step}`}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Step {step}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={background(pageColors[`step${step}`])}>
        <h1>Step {step} ({step === 1 ? 'green' : 'red'})</h1>
        <IonButton onClick={() => router.push(next, 'forward')}>{label}</IonButton>
      </IonContent>
    </IonPage>
  );
};

const HomePage: React.FC = () => {
  const router = useIonRouter();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={background(pageColors.home)}>
        <h1>Home (blue)</h1>
        <IonButton onClick={() => router.push('/settings', 'forward')}>Settings</IonButton>
      </IonContent>
    </IonPage>
  );
};

const SettingsPage: React.FC = () => {
  const router = useIonRouter();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={background(pageColors.settings)}>
        <h1>Settings (purple)</h1>
        <IonButton onClick={() => router.push('/onboarding/step1', 'forward')}>Back to Step 1</IonButton>
      </IonContent>
    </IonPage>
  );
};

/** A child outlet that is itself the page of its parent route (`ionPage`). */
const OnboardingOutlet: React.FC = () => (
  <IonRouterOutlet ionPage>
    <Route path="step1" element={<Step step={1} next="/onboarding/step2" label="Next" />} />
    <Route path="step2" element={<Step step={2} next="/home" label="Finish" />} />
  </IonRouterOutlet>
);

/** Lists the pages in the onboarding outlet that are not hidden, outside the router. */
const Status: React.FC = () => {
  const [visible, setVisible] = useState<string[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      const pages = document.querySelectorAll('[data-testid^="step-"]');
      setVisible(
        Array.from(pages)
          .filter((page) => !page.classList.contains('ion-page-hidden') && page.getAttribute('aria-hidden') !== 'true')
          .map((page) => page.getAttribute('data-testid') ?? '?')
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);
  return (
    <div
      data-testid="status"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999, padding: 8, background: '#ffd', color: '#000', fontFamily: 'monospace' }}
    >
      Visible onboarding pages: {visible.length > 0 ? visible.join(', ') : 'none'}
      {visible.length > 1 ? ' ← BUG: more than one' : ''}
    </div>
  );
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/onboarding/*" element={<OnboardingOutlet />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<Navigate to="/onboarding/step1" replace />} />
      </IonRouterOutlet>
    </IonReactRouter>
    <Status />
  </IonApp>
);

export default App;
