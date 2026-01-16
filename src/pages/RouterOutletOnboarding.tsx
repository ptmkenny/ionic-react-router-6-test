import { Route, Navigate } from 'react-router-dom';
import {
  IonPage,
  IonRouterOutlet,
} from '@ionic/react';
import PageOnboardingVerifyEmail from './PageOnboardingVerifyEmail';

/**
 * This matches the original bug structure:
 * RouterOutletOnboarding
 * └─ IonPage
 *     └─ IonRouterOutlet (inner)
 *         └─ Route verify-email → PageOnboardingVerifyEmail
 *
 * When navigating from tabs (*) to /onboarding/verify-email,
 * the outer outlet gets aria-hidden="true" stuck on it.
 */
const RouterOutletOnboarding: React.FC = () => {
  return (
    <IonPage>
      <IonRouterOutlet id="onboarding-outlet">
        <Route path="verify-email" element={<PageOnboardingVerifyEmail />} />
        <Route index element={<Navigate to="verify-email" replace />} />
      </IonRouterOutlet>
    </IonPage>
  );
};

export default RouterOutletOnboarding;
