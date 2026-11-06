import { useEffect, useState } from 'react';
import { Navigate, Route, useSearchParams } from 'react-router-dom';
import {
  IonApp,
  IonButton,
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
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

setupIonicReact();

const ApplePage: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Apple</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <p>Press the Orange tab, then a redirect button.</p>
    </IonContent>
  </IonPage>
);

/**
 * 0 ms redirects in the render that mounts the banana outlet (path B). 10-20 ms lets the
 * forward transition to the banana outlet start first (path A). 50 ms is a control: the
 * transition finishes before the redirect, and only Apple is left visible.
 */
const redirectDelaysMs = [0, 10, 20, 50];

/** The delay of the last redirect button pressed, for the status bar. */
let lastDelayMs: number | undefined;

/** An auth guard for anonymous users: redirects to /apple, optionally after a delay. */
const RedirectToApple: React.FC = () => {
  const [searchParams] = useSearchParams();
  const delayMs = Number(searchParams.get('delay') ?? 0);
  const [redirect, setRedirect] = useState(delayMs === 0);
  useEffect(() => {
    if (delayMs === 0) {
      return undefined;
    }
    const timeout = setTimeout(() => setRedirect(true), delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs]);
  return redirect ? <Navigate replace to="/apple" /> : null;
};

const OrangePage: React.FC = () => {
  const router = useIonRouter();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Orange</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>/banana/redirect redirects anonymous users to /apple after the delay in the URL.</p>
        {redirectDelaysMs.map((delayMs) => (
          <IonButton
            key={delayMs}
            onClick={() => {
              lastDelayMs = delayMs;
              router.push(`/banana/redirect?delay=${delayMs}`, 'forward', 'push');
            }}
          >
            Redirect after {delayMs} ms
          </IonButton>
        ))}
      </IonContent>
    </IonPage>
  );
};

/** Names the tab outlets that are not hidden, by their class. */
const visibleTabOutlets = (): string[] => {
  const tabsOutlet = document.querySelector('ion-tabs ion-router-outlet');
  if (!tabsOutlet) {
    return [];
  }
  return Array.from(tabsOutlet.children)
    .filter((child): child is HTMLElement => child instanceof HTMLElement)
    .filter((child) => child.classList.contains('ion-page') && !child.classList.contains('ion-page-hidden'))
    .map((child) => {
      const name = ['apple', 'orange', 'banana'].find((outlet) => child.classList.contains(`${outlet}-outlet`)) ?? '?';
      return child.childElementCount === 0 ? `${name} (empty)` : name;
    });
};

/** Reports, outside the router, how many tab outlets are visible after each redirect. */
const Status: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  useEffect(() => {
    let lastPath = window.location.pathname;
    const interval = setInterval(() => {
      const path = window.location.pathname;
      if (path === '/apple' && lastPath !== '/apple') {
        const delayMs = lastDelayMs;
        setTimeout(() => {
          const visible = visibleTabOutlets();
          const path = visible.some((name) => name.startsWith('banana'))
            ? ' ← BUG path A'
            : visible.some((name) => name.startsWith('orange'))
              ? ' ← BUG path B'
              : '';
          setResults((all) => [...all, `${delayMs ?? '?'} ms: ${visible.join(' + ')}${path}`]);
        }, 1000);
      }
      lastPath = path;
    }, 20);
    return () => clearInterval(interval);
  }, []);
  const stale = results.filter((r) => r.includes('BUG')).length;
  return (
    <div
      data-testid="status"
      style={{ position: 'fixed', bottom: 60, left: 0, right: 0, zIndex: 99999, padding: 8, background: '#ffd', color: '#000', fontFamily: 'monospace' }}
    >
      Redirects: {results.length} · more than one tab outlet visible: {stale}
      {results.length > 0 ? ` · last: ${results[results.length - 1]}` : ''}
    </div>
  );
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/" element={<Navigate replace to="/apple" />} />
        <Route
          path="*"
          element={
            <IonTabs>
              <IonRouterOutlet>
                <Route
                  path="/apple/*"
                  element={
                    <IonRouterOutlet ionPage className="apple-outlet">
                      <Route index element={<ApplePage />} />
                    </IonRouterOutlet>
                  }
                />
                <Route
                  path="/orange/*"
                  element={
                    <IonRouterOutlet ionPage className="orange-outlet">
                      <Route index element={<OrangePage />} />
                    </IonRouterOutlet>
                  }
                />
                <Route
                  path="/banana/*"
                  element={
                    <IonRouterOutlet ionPage className="banana-outlet">
                      <Route path="redirect" element={<RedirectToApple />} />
                    </IonRouterOutlet>
                  }
                />
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="apple" href="/apple">
                  <IonLabel>Apple</IonLabel>
                </IonTabButton>
                <IonTabButton tab="orange" href="/orange">
                  <IonLabel>Orange</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          }
        />
      </IonRouterOutlet>
      <Status />
    </IonReactRouter>
  </IonApp>
);

export default App;
