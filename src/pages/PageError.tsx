import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

type PageErrorProps = Readonly<{
  message: string;
}>;

const PageError: React.FC<PageErrorProps> = ({ message }: PageErrorProps) => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/content" />
        </IonButtons>
        <IonTitle>Error</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <h2>Error fallback page</h2>
      <p>This content should render normally.</p>
      <p>{message}</p>
    </IonContent>
  </IonPage>
);

export default PageError;
