import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { ellipse, triangle } from 'ionicons/icons';

/**
 * Wrapper component for tabs - matches original WrapperIonTabs structure.
 * IonRouterOutlet is passed as children (not created inside).
 * This is the key structural difference that triggers the aria-hidden bug.
 */
const WrapperIonTabs: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <IonTabs>
      {children}
      <IonTabBar slot="bottom">
        <IonTabButton tab="tab1" href="/tab1">
          <IonIcon aria-hidden="true" icon={triangle} />
          <IonLabel>Tab 1</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab2" href="/tab2">
          <IonIcon aria-hidden="true" icon={ellipse} />
          <IonLabel>Tab 2</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default WrapperIonTabs;
