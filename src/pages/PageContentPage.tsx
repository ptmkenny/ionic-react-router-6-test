import { useParams } from 'react-router-dom';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import PageError from './PageError';
import { useTopStoriesQuery } from './hackerNewsQuery';

const PageContentPage: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const validResourceId = resourceId ?? '';
  const stories = useTopStoriesQuery();
  const story = stories.find(
    (candidateStory) => candidateStory.id.toString() === validResourceId,
  );

  if (!story) {
    return (
      <PageError
        message={`Failed to load item with id ${validResourceId}`}
      />
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{story.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>Item id: {story.id.toString()}</p>
        <p>Author: {story.by}</p>
        {story.url ? (
          <p>
            External URL:
            {' '}
            {story.url}
          </p>
        ) : (
          <p>This story does not include an external URL.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PageContentPage;
