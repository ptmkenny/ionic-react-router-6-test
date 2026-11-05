import { createContext, useContext, useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import {
  IonApp,
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonRouterOutlet,
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

type Auth = { loggedIn: boolean; setLoggedIn: (loggedIn: boolean) => void };
const AuthContext = createContext<Auth>({ loggedIn: false, setLoggedIn: () => undefined });

const JoinPage: React.FC = () => {
  const { setLoggedIn } = useContext(AuthContext);
  const router = useIonRouter();
  const logIn = () => {
    setLoggedIn(true);
    router.push('/verify', 'forward');
  };
  return (
    <IonPage data-testid="join-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Join</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>Logged out.</p>
        <IonButton onClick={logIn}>Log in</IonButton>
      </IonContent>
    </IonPage>
  );
};

/** Only anonymous users see the join page; logged-in users get no page here. */
const GuardAnonOnly: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { loggedIn } = useContext(AuthContext);
  return loggedIn ? null : children;
};

const NotFoundPage: React.FC = () => (
  <IonPage>
    <IonContent className="ion-padding">Not found</IonContent>
  </IonPage>
);

const VerifyPage: React.FC = () => {
  const { setLoggedIn } = useContext(AuthContext);
  const router = useIonRouter();
  // The user becomes anonymous and the app navigates to /join in the same tick. The
  // guard mounts the join page in that commit, while Ionic's routeInfo is still /verify.
  const logOut = () => {
    setLoggedIn(false);
    router.navigateRoot('/join');
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Verify</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>Logged in.</p>
        <IonButton onClick={logOut}>Log out</IonButton>
      </IonContent>
    </IonPage>
  );
};

/** Reports whether the join page is visible after each logout, outside the router. */
const Status: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  useEffect(() => {
    let lastPath = window.location.pathname;
    const interval = setInterval(() => {
      const path = window.location.pathname;
      if (path === '/join' && lastPath === '/verify') {
        setTimeout(() => {
          const page = document.querySelector('[data-testid="join-page"]');
          const hidden = !page || page.closest('.ion-page-hidden, [aria-hidden="true"]') !== null;
          setResults((all) => [...all, hidden ? 'hidden' : 'visible']);
        }, 1000);
      }
      lastPath = path;
    }, 20);
    return () => clearInterval(interval);
  }, []);
  const hidden = results.filter((r) => r === 'hidden').length;
  return (
    <div
      data-testid="status"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999, padding: 8, background: '#ffd', color: '#000', fontFamily: 'monospace' }}
    >
      Logouts: {results.length} · join page left hidden: {hidden}
      {results.length > 0 ? ` · last: ${results[results.length - 1]}` : ''}
    </div>
  );
};

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/verify" element={<VerifyPage />} />
            <Route
              path="*"
              element={
                <IonPage>
                  <IonRouterOutlet>
                    <Route
                      path="/join/*"
                      element={
                        <GuardAnonOnly>
                          <JoinPage />
                        </GuardAnonOnly>
                      }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                  </IonRouterOutlet>
                </IonPage>
              }
            />
          </IonRouterOutlet>
        </IonReactRouter>
        <Status />
      </IonApp>
    </AuthContext.Provider>
  );
};

export default App;
