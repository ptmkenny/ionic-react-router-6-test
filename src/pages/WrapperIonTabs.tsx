import type { ReactNode } from 'react';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { ellipse, list, triangle } from 'ionicons/icons';

type WrapperIonTabsProps = Readonly<{
  children: ReactNode;
}>;

const WrapperIonTabs: React.FC<WrapperIonTabsProps> = ({ children }: WrapperIonTabsProps) => (
  <IonTabs>
    {children}
    <IonTabBar slot="bottom">
      <IonTabButton tab="tab1" href="/tab1">
        <IonIcon aria-hidden="true" icon={triangle} />
        <IonLabel>Start</IonLabel>
      </IonTabButton>
      <IonTabButton tab="content" href="/content">
        <IonIcon aria-hidden="true" icon={list} />
        <IonLabel>Content</IonLabel>
      </IonTabButton>
      <IonTabButton tab="tab2" href="/tab2">
        <IonIcon aria-hidden="true" icon={ellipse} />
        <IonLabel>Other</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

export default WrapperIonTabs;
