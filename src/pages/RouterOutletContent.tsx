import { Suspense } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { IonRouterOutlet, IonSpinner } from '@ionic/react';
import PageContentIndex from './PageContentIndex';
import PageContentPage from './PageContentPage';

const RouterOutletContent: React.FC = () => (
  <Suspense fallback={<IonSpinner />}>
    <IonRouterOutlet id="content-outlet">
      <Route index element={<PageContentIndex />} />
      <Route
        path="pages/:resourceId"
        element={<PageContentPage key="resourceId" />}
      />
      <Route path="pages" element={<Navigate to="/content" replace />} />
    </IonRouterOutlet>
  </Suspense>
);

export default RouterOutletContent;
