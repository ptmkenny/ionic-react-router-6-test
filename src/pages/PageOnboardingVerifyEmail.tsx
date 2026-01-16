import { useEffect, useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

/**
 * This page is rendered inside a nested IonRouterOutlet (inside RouterOutletOnboarding).
 * After navigating here from tabs, the outer outlet should have
 * aria-hidden="true" incorrectly set on it.
 */
const PageOnboardingVerifyEmail: React.FC = () => {
  const [ariaHiddenDetected, setAriaHiddenDetected] = useState(false);

  useEffect(() => {
    const checkAriaHidden = () => {
      const outerOutlet = document.getElementById('outer-outlet');
      if (outerOutlet) {
        const hasAriaHidden = outerOutlet.getAttribute('aria-hidden') === 'true';
        if (hasAriaHidden) {
          setAriaHiddenDetected(true);
          console.error(
            '🐛 BUG DETECTED: aria-hidden="true" is set on outer-outlet!',
            outerOutlet
          );
        }
      }
    };

    // Check immediately
    checkAriaHidden();

    // Use MutationObserver to detect when aria-hidden is set
    const outerOutlet = document.getElementById('outer-outlet');
    if (outerOutlet) {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
            checkAriaHidden();
          }
        }
      });
      observer.observe(outerOutlet, { attributes: true });

      // Also check periodically during transition
      const intervals = [100, 300, 500, 1000];
      const timeouts = intervals.map(ms => setTimeout(checkAriaHidden, ms));

      return () => {
        observer.disconnect();
        timeouts.forEach(clearTimeout);
      };
    }
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab1" />
          </IonButtons>
          <IonTitle>Verify Email</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Email Verification Page</h2>
        <p>This page is inside a nested IonRouterOutlet under /onboarding.</p>

        {/* Bug indicator */}
        <div
          style={{
            padding: '16px',
            marginTop: '16px',
            borderRadius: '8px',
            backgroundColor: ariaHiddenDetected ? '#ffcccc' : '#ccffcc',
            border: `2px solid ${ariaHiddenDetected ? '#ff0000' : '#00ff00'}`,
          }}
        >
          {ariaHiddenDetected ? (
            <>
              <strong style={{ color: '#cc0000' }}>
                🐛 BUG DETECTED: aria-hidden=&quot;true&quot; on outer outlet!
              </strong>
              <p style={{ marginTop: '8px', marginBottom: 0 }}>
                The outer ion-router-outlet has aria-hidden=&quot;true&quot; stuck on it.
                This breaks accessibility and causes Playwright tests to fail.
              </p>
            </>
          ) : (
            <strong style={{ color: '#008800' }}>
              ✓ No aria-hidden bug detected (check console for updates)
            </strong>
          )}
        </div>

        <IonButton
          expand="block"
          style={{ marginTop: '24px' }}
          routerLink="/tab1"
        >
          Back to Tab 1
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default PageOnboardingVerifyEmail;
