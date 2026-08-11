import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import './Tab1.css';

// An ordinary wrapper that forwards an optional prop. Nothing here is unusual:
// when the caller passes no id, `id` is undefined, exactly as React intends.
const MyToggle: React.FC<{ id?: string }> = ({ id }) => <IonToggle id={id}>Toggle</IonToggle>;

const Tab1: React.FC = () => {
  const [id, setId] = useState<string | undefined>(undefined);
  const [observed, setObserved] = useState<string | null>(null);
  const host = useRef<HTMLDivElement>(null);

  // Read the attribute the element actually ended up with, after Ionic's React
  // wrapper has synced its props in componentDidMount / componentDidUpdate.
  useEffect(() => {
    const toggle = host.current?.querySelector('ion-toggle');
    setObserved(toggle ? toggle.getAttribute('id') : null);
  }, [id]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div ref={host}>
          <MyToggle id={id} />
        </div>

        <p>
          id prop passed: <code>{id === undefined ? 'undefined' : JSON.stringify(id)}</code>
        </p>
        <p>
          id attribute on <code>&lt;ion-toggle&gt;</code>:{' '}
          <code data-testid="observed">{observed === null ? '(none)' : JSON.stringify(observed)}</code>
        </p>
        <p>
          Expected when the prop is undefined: <code>(none)</code>.
        </p>

        <IonButton onClick={() => setId('real-id')}>Pass id=&quot;real-id&quot;</IonButton>
        <IonButton onClick={() => setId(undefined)}>Pass id=undefined</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
