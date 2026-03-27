import {
  IonButton,
  IonContent,
  IonHeader,
  IonList,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useTopStoriesQuery } from './hackerNewsQuery';

const missingStoryId = 'story-not-loaded';

const PageContentIndex: React.FC = () => {
  const stories = useTopStoriesQuery();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Content index</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Recent items</h2>
        <p>
          This page suspends while loading the latest five Hacker News stories.
        </p>
        <IonList inset>
          {stories.map((story) => (
            <IonItem
              key={story.id}
              button
              routerLink={`/content/pages/${story.id.toString()}`}
            >
              <IonLabel>
                <h2>{story.title}</h2>
                <p>by {story.by}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        <IonButton
          expand="block"
          routerLink={`/content/pages/${missingStoryId}`}
        >
          Open non-loaded item
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default PageContentIndex;
