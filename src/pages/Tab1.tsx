import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import './Tab1.css';

/**
 * Each case pins what `ion-select` should display for the selected option, which
 * is the text a browser paints for that option's markup.
 */
const CASES = [
  {
    id: 'adjacent',
    label: 'Adjacent text nodes',
    markup: "{'★'}{'Star'}",
    expected: '★Star',
  },
  {
    id: 'wrapped',
    label: 'Text wrapped in an element',
    markup: 'A <b>Star</b>',
    expected: 'A Star',
  },
] as const;

type Reading = {
  id: string;
  displayed: string;
  ariaLabel: string;
};

/**
 * Waits for the select to upgrade and paint its selected text. Ionic 9 ships the
 * custom-elements build, which has no `componentOnReady`, so poll the rendered
 * shadow DOM instead.
 */
const waitForSelectedText = async (select: HTMLIonSelectElement): Promise<void> => {
  await customElements.whenDefined('ion-select');

  for (let attempt = 0; attempt < 60; attempt++) {
    if (select.shadowRoot?.querySelector('.select-text') != null) {
      return;
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
};

const Tab1: React.FC = () => {
  const [readings, setReadings] = useState<Reading[]>([]);

  useEffect(() => {
    let cancelled = false;

    const read = async () => {
      const next: Reading[] = [];

      for (const testCase of CASES) {
        const select = document.querySelector<HTMLIonSelectElement>(
          `ion-select[data-case="${testCase.id}"]`
        );
        if (select === null) {
          continue;
        }

        await waitForSelectedText(select);

        next.push({
          id: testCase.id,
          displayed: select.shadowRoot?.querySelector('.select-text')?.textContent ?? '',
          ariaLabel: select.shadowRoot?.querySelector('button')?.getAttribute('aria-label') ?? '',
        });
      }

      if (!cancelled) {
        setReadings(next);
      }
    };

    void read();

    return () => {
      cancelled = true;
    };
  }, []);

  const failures = readings.filter((reading) => {
    const testCase = CASES.find((candidate) => candidate.id === reading.id);
    return testCase !== undefined && reading.displayed !== testCase.expected;
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ion-select option text</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <h2>{readings.length === 0 ? 'Reading…' : `${failures.length} of ${CASES.length} wrong`}</h2>

        <IonList>
          <IonItem>
            <IonSelect data-case="adjacent" label="Adjacent text nodes" value="star">
              {/*
                Two sibling text nodes with no whitespace between them, the shape any
                framework produces for `{icon}{label}`.
              */}
              <IonSelectOption value="star">
                {'★'}
                {'Star'}
              </IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonSelect data-case="wrapped" label="Wrapped in an element" value="star">
              <IonSelectOption value="star">
                A <b>Star</b>
              </IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>

        {readings.map((reading) => {
          const testCase = CASES.find((candidate) => candidate.id === reading.id);
          if (testCase === undefined) {
            return null;
          }
          const ok = reading.displayed === testCase.expected;

          return (
            <IonItem key={reading.id} lines="none">
              <IonLabel className="ion-text-wrap">
                <h3>
                  {ok ? '✅' : '❌'} {testCase.label}
                </h3>
                <p>option content: {testCase.markup}</p>
                <p>expected: {JSON.stringify(testCase.expected)}</p>
                <p>displayed: {JSON.stringify(reading.displayed)}</p>
                <p>aria-label: {JSON.stringify(reading.ariaLabel)}</p>
              </IonLabel>
            </IonItem>
          );
        })}

        <IonNote className="ion-padding-start">
          Open either select to see the same text in the alert interface.
        </IonNote>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
