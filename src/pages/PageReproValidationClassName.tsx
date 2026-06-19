import { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

/**
 * Minimal reproduction: setting `className` on an Ionic React form control
 * overwrites the Stencil-managed runtime classes (`hydrated`, `sc-ion-input-*`,
 * `ion-color`, `md`/`ios`) instead of merging with them.
 *
 * This is Ionic's documented validation pattern: toggle `ion-invalid` +
 * `ion-touched` via `className` so the control shows its `errorText`. Under the
 * @lit/react-based wrapper the `class` attribute is replaced wholesale, so the
 * scope class the scoped error-text CSS depends on is wiped and the error
 * message renders in the DOM but stays `display: none`.
 */

type Readout = {
  hostClass: string;
  hasHydrated: boolean;
  hasScopeClass: boolean;
  errorText: string;
  errorDisplay: string;
};

const inspect = (): Readout | null => {
  const host = document.querySelector('ion-input');
  if (host === null) {
    return null;
  }
  const errorEl = host.querySelector('.error-text');
  return {
    hostClass: host.className,
    hasHydrated: host.classList.contains('hydrated'),
    hasScopeClass: Array.from(host.classList).some((token) =>
      token.startsWith('sc-ion-input'),
    ),
    errorText: errorEl?.textContent ?? '(no .error-text element)',
    errorDisplay:
      errorEl === null ? 'n/a' : getComputedStyle(errorEl).display,
  };
};

const PageReproValidationClassName: React.FC = () => {
  const [validated, setValidated] = useState(false);
  const [readout, setReadout] = useState<Readout | null>(null);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>className clobbering MRE</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>What this shows</h2>
        <p>
          Setting <code>className</code> on an Ionic React form control replaces
          the element&apos;s entire <code>class</code> attribute instead of
          merging with the classes Stencil manages at runtime (
          <code>hydrated</code>, <code>sc-ion-input-*</code>,{' '}
          <code>ion-color</code>, <code>md</code>/<code>ios</code>).
        </p>
        <p>
          The input below uses Ionic&apos;s documented validation pattern:
          toggle <code>ion-invalid ion-touched</code> via <code>className</code>{' '}
          so its <code>errorText</code> appears.
        </p>

        <IonList>
          <IonItem>
            <IonInput
              label="Email"
              labelPlacement="stacked"
              fill="solid"
              errorText="Enter your email."
              className={validated ? 'ion-invalid ion-touched' : 'ion-valid'}
            />
          </IonItem>
        </IonList>

        <p>
          Tip: press <em>Inspect</em> first to see the healthy{' '}
          <code>ion-valid</code> + Stencil classes, then <em>Apply</em>, then{' '}
          <em>Inspect</em> again to see them wiped.
        </p>

        <IonButton
          expand="block"
          onClick={() => {
            setValidated(true);
          }}
        >
          1. Apply validation classes
        </IonButton>
        <IonButton
          expand="block"
          fill="outline"
          onClick={() => {
            setReadout(inspect());
          }}
        >
          2. Inspect the &lt;ion-input&gt; host
        </IonButton>

        {readout === null ? null : (
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              background: 'var(--ion-color-light, #f4f5f8)',
              padding: '12px',
              borderRadius: '8px',
            }}
          >
            {`host class attribute:\n  ${readout.hostClass}\n\n`}
            {`has "hydrated" class:        ${String(readout.hasHydrated)}\n`}
            {`has "sc-ion-input-*" class:  ${String(readout.hasScopeClass)}\n\n`}
            {`error-text content:  ${readout.errorText}\n`}
            {`error-text display:  ${readout.errorDisplay}`}
          </pre>
        )}

        <h2>Expected vs actual</h2>
        <p>
          <strong>Expected:</strong> after step 1 the error message
          &ldquo;Enter your email.&rdquo; is visible; the host class is the merge
          of the validation classes and the Stencil classes (so{' '}
          <code>hydrated</code> and <code>sc-ion-input-*</code> are still
          present).
        </p>
        <p>
          <strong>Actual:</strong> no error message is visible. Step 2 shows the
          host class is exactly <code>ion-invalid ion-touched</code> —{' '}
          <code>hydrated</code> and <code>sc-ion-input-*</code> are gone — and
          the <code>.error-text</code> element exists with the correct text but
          computes <code>display: none</code>.
        </p>
        <p>
          The legacy <code>createReactComponent</code> wrapper merged{' '}
          <code>className</code> with the element&apos;s existing classes; the{' '}
          <code>@lit/react</code> <code>createComponent</code> wrapper sets the{' '}
          <code>class</code> attribute directly, which removes them. This breaks
          Ionic&apos;s class-based validation and any third-party form library
          (TanStack Form, React Hook Form, Formik) that drives validation state
          through <code>className</code>.
        </p>
      </IonContent>
    </IonPage>
  );
};

export default PageReproValidationClassName;
