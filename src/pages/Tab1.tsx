import { IonPage, IonRouterOutlet } from '@ionic/react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Route } from 'react-router-dom';

// Child componentDidMount runs before this parent layout effect. Remove the
// outlet before Ionic's deferred componentOnReady callback runs.
const TransientOutlet: React.FC<{ onUnmount: () => void }> = ({ onUnmount }) => {
  useLayoutEffect(onUnmount, [onUnmount]);
  return (
    <IonRouterOutlet ionPage>
      <Route path="*" element={<IonPage>Transient page</IonPage>} />
    </IonRouterOutlet>
  );
};

const Tab1: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const record = (value: unknown) => {
      const message = value instanceof Error ? value.stack ?? value.message : String(value);
      setErrors((previous) => [...previous, message]);
    };
    const onError = (event: ErrorEvent) => record(event.error ?? event.message);
    const onRejection = (event: PromiseRejectionEvent) => record(event.reason);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return (
    <main style={{ padding: 24, overflow: 'auto', height: '100%' }}>
      <h1>OutletPageManager: unmount before hydration</h1>
      <p>Mount a nested outlet and immediately remove it in a layout effect.</p>
      <button onClick={() => { setAttempts((count) => count + 1); setMounted(true); }}>
        Mount and unmount outlet
      </button>
      <p>Attempts: {attempts}</p>
      <p role="status">Uncaught errors: {errors.length}</p>
      {errors.map((error, index) => <pre key={index} style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>)}
      {mounted && <TransientOutlet onUnmount={() => setMounted(false)} />}
    </main>
  );
};

export default Tab1;
