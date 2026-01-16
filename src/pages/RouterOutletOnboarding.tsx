import { Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import {
  IonRouterOutlet,
  IonSpinner,
} from '@ionic/react';
import PageOnboardingVerifyEmail from './PageOnboardingVerifyEmail';

/**
 * Matches the main app structure:
 * RouterOutletOnboarding
 * └─ Suspense (with fallback)
 *     └─ IonRouterOutlet (inner - NO IonPage wrapper)
 *         └─ Route verify-email → PageOnboardingVerifyEmail
 *
 * Critical: No IonPage wrapper around IonRouterOutlet.
 * The main app does not wrap nested outlets in IonPage.
 */
const RouterOutletOnboarding: React.FC = () => {
  return (
    <Suspense fallback={<IonSpinner />}>
      <IonRouterOutlet id="onboarding-outlet">
        <Route path="verify-email" element={<PageOnboardingVerifyEmail />} />
        <Route index element={<Navigate to="verify-email" replace />} />
      </IonRouterOutlet>
    </Suspense>
  );
};

export default RouterOutletOnboarding;
