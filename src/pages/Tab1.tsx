import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Suspense, useEffect, useRef, useState } from 'react';
import './Tab1.css';

/**
 * The nested modal's body suspends the first time it renders, standing in for
 * any suspense query that has not been cached yet. The React wrapper mounts an
 * inline overlay's children from its `ionMount` handler, and core emits
 * `ionMount` in the middle of `present()`, so this suspension always lands
 * while the nested modal is presenting.
 *
 * Module scope, so a second run finds the value cached and does not suspend —
 * which is what makes the nested modal open normally the second time.
 */
let bodyResolved = false;
let bodyPromise: Promise<void> | null = null;

const clearBodyCache = () => {
  bodyResolved = false;
  bodyPromise = null;
};

const NestedModalBody: React.FC = () => {
  if (!bodyResolved) {
    const pending = (bodyPromise ??= new Promise<void>((resolve) => {
      window.setTimeout(() => {
        bodyResolved = true;
        resolve();
      }, 50);
    }));

    throw pending;
  }

  return <IonLabel>Nested modal body. The suspending query has resolved.</IonLabel>;
};

/** Overlay lifecycle events, watched at the document so the log survives the hide. */
const MODAL_EVENTS = [
  'ionMount',
  'ionModalWillPresent',
  'ionModalDidPresent',
  'ionModalDidDismiss',
] as const;

type LoggedEvent = {
  at: number;
  type: string;
  modal: string;
};

const Tab1: React.FC = () => {
  const [isOuterOpen, setIsOuterOpen] = useState(false);
  const [isNestedOpen, setIsNestedOpen] = useState(false);
  const [runId, setRunId] = useState(0);
  const [events, setEvents] = useState<LoggedEvent[]>([]);
  const [isHostConnected, setIsHostConnected] = useState<boolean | null>(null);

  /**
   * Kept outside the Suspense boundary on purpose. React detaches refs and tears
   * down effects inside a boundary it hides, so anything that has to observe the
   * hide has to live above it.
   */
  const nestedHost = useRef<HTMLIonModalElement | null>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    const handleModalEvent = (event: Event) => {
      const modal = (event.target as HTMLElement | null)?.dataset?.repro;
      if (modal === undefined) {
        return;
      }

      setEvents((previous) => [
        ...previous,
        { at: Math.round(performance.now() - startedAt.current), type: event.type, modal },
      ]);
    };

    MODAL_EVENTS.forEach((type) => document.addEventListener(type, handleModalEvent));

    return () => {
      MODAL_EVENTS.forEach((type) => document.removeEventListener(type, handleModalEvent));
    };
  }, []);

  /**
   * `key={runId}` gives each run a fresh wrapper instance: when the bug bites,
   * nothing dismisses the destroyed overlay, so `isNestedOpen` stays `true` and
   * a plain re-click would be a no-op.
   */
  const openNestedModal = () => {
    startedAt.current = performance.now();
    setEvents([]);
    setIsHostConnected(null);
    nestedHost.current = null;
    setRunId((previous) => previous + 1);
    setIsNestedOpen(true);

    // Long after `present()` would have finished.
    window.setTimeout(() => {
      setIsHostConnected(nestedHost.current?.isConnected ?? false);
    }, 1000);
  };

  const nestedEvents = events.filter((event) => event.modal === 'nested');
  const sawIonMount = nestedEvents.some((event) => event.type === 'ionMount');
  const sawDidPresent = nestedEvents.some((event) => event.type === 'ionModalDidPresent');
  const isBroken = isHostConnected === false && sawIonMount && !sawDidPresent;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Nested overlay + Suspense</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonButton expand="block" onClick={() => setIsOuterOpen(true)}>
          Open outer modal
        </IonButton>

        {isHostConnected !== null && (
          <>
            <h2>{isBroken ? '❌ The nested modal was destroyed while presenting' : '✅ The nested modal presented'}</h2>
            <IonList>
              <IonItem lines="none">
                <IonLabel className="ion-text-wrap">
                  <p>nested host still in the document: {String(isHostConnected)}</p>
                  <p>ionMount fired: {String(sawIonMount)}</p>
                  <p>ionModalDidPresent fired: {String(sawDidPresent)}</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </>
        )}

        {events.length > 0 && (
          <IonList>
            {events.map((event, index) => (
              <IonItem key={index} lines="none">
                <IonLabel className="ion-text-wrap">
                  <p>
                    {event.at}ms · {event.modal} · {event.type}
                  </p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonModal data-repro="outer" isOpen={isOuterOpen} onDidDismiss={() => setIsOuterOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Outer modal</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsOuterOpen(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {/*
              The boundary that owns the nested overlay host. When the modal body
              below suspends, React hides everything in here — including the
              nested `ion-modal` that is presenting at that moment.
            */}
            <Suspense fallback={<IonNote>Loading…</IonNote>}>
              <IonButton expand="block" onClick={openNestedModal}>
                Open nested modal
              </IonButton>

              <IonModal
                data-repro="nested"
                key={runId}
                ref={(element: HTMLIonModalElement | null) => {
                  if (element !== null) {
                    nestedHost.current = element;
                  }
                }}
                isOpen={isNestedOpen}
                onDidDismiss={() => setIsNestedOpen(false)}
              >
                <IonContent className="ion-padding">
                  <NestedModalBody />
                  <IonButton expand="block" onClick={() => setIsNestedOpen(false)}>
                    Close
                  </IonButton>
                </IonContent>
              </IonModal>
            </Suspense>
          </IonContent>
        </IonModal>
      </IonContent>

      <IonButton expand="block" fill="clear" onClick={clearBodyCache}>
        Clear the cache (makes the next run suspend again)
      </IonButton>
    </IonPage>
  );
};

export default Tab1;
