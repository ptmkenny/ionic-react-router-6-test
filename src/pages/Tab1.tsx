import { useCallback, useEffect, useRef, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import './Tab1.css';

/**
 * Minimal reproduction for the ion-refresher unmount race.
 *
 * ion-refresher's native setup does:
 *
 *   this.gesture = (await import('../../utils/gesture')).createGesture({
 *     el: this.scrollEl!,
 *     ...
 *   });
 *
 * The dynamic import yields to the event loop. If the refresher is disconnected
 * while it resolves, disconnectedCallback() has already set scrollEl = undefined,
 * so the gesture attaches a listener to undefined and throws:
 *
 *   TypeError: Cannot read properties of undefined
 *              (reading '__zone_symbol__addEventListener')
 *
 * Nothing awaits the setup method, so it surfaces as an unhandled rejection.
 *
 * No router is involved: the race only needs the refresher's host to be removed
 * from the DOM while that import is in flight.
 */

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/** Default IonRefresherContent keeps the spinners, which selects the NATIVE refresher. */
const RefresherHost: React.FC = () => (
  <IonContent>
    <IonRefresher slot="fixed" onIonRefresh={(event) => event.detail.complete()}>
      <IonRefresherContent />
    </IonRefresher>
  </IonContent>
);

const cycleCount = 40;

const Tab1: React.FC = () => {
  const [hostMounted, setHostMounted] = useState(false);
  const [cyclesRun, setCyclesRun] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason: unknown = event.reason;
      const message =
        reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason);
      setErrors((previous) => [...previous, message]);
    };

    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('unhandledrejection', onRejection);
      cancelled.current = true;
    };
  }, []);

  /**
   * Sweeps the unmount delay across the race window, since the width of that
   * window depends on how long the gesture chunk takes to load.
   */
  const runRace = useCallback(async () => {
    // StrictMode double-invokes effects, so the cleanup above may already have
    // flipped this. Reset it when the user actually starts a run.
    cancelled.current = false;
    setRunning(true);
    setErrors([]);
    setCyclesRun(0);

    for (let cycle = 0; cycle < cycleCount; cycle += 1) {
      if (cancelled.current) {
        break;
      }
      setHostMounted(true);
      await sleep(cycle);
      setHostMounted(false);
      await sleep(30);
      setCyclesRun(cycle + 1);
    }

    setRunning(false);
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ion-refresher unmount race</IonTitle>
        </IonToolbar>
      </IonHeader>

      {hostMounted ? (
        <RefresherHost />
      ) : (
        <IonContent className="ion-padding">
          <p>
            Mounts an <code>ion-refresher</code> and unmounts it again while its gesture
            module is still being imported.
          </p>
          <ol>
            <li>
              Press <strong>Run race</strong>.
            </li>
            <li>
              Observe the uncaught <code>TypeError</code> in the console, and counted
              below.
            </li>
          </ol>
          <p>
            If no rejection is reported, throttle the network to Slow 3G and hard-reload
            to widen the window.
          </p>

          <IonButton onClick={runRace} disabled={running}>
            {running ? 'Running…' : 'Run race'}
          </IonButton>

          <p>
            Cycles run: {cyclesRun} / {cycleCount}
          </p>

          <p>
            Unhandled rejections: <strong>{errors.length}</strong>
          </p>
          {errors.map((message, index) => (
            // eslint-disable-next-line react/no-array-index-key -- messages repeat.
            <p key={index}>{message}</p>
          ))}
        </IonContent>
      )}
    </IonPage>
  );
};

export default Tab1;
