/**
 * Reproduction for nuqs issue: a `history: 'push'` write with `shallow: false`
 * adds a browser history entry but reports it to react-router as a *replace*.
 *
 * Deliberately free of Ionic: this entry mounts nothing but react-router's
 * BrowserRouter, NuqsAdapter, and one component, so what it shows is the
 * adapter's contract with react-router and nothing else.
 *
 * Served at /nuqs-repro.html — see README-nuqs-repro.md.
 */
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { useQueryState, parseAsString } from 'nuqs';

type Reading = {
  label: string;
  href: string;
  historyLength: number;
  idx: number | null;
  key: string;
};

const readHistoryState = (): { idx: number | null } => {
  const state: unknown = window.history.state;
  if (typeof state === 'object' && state !== null && 'idx' in state) {
    const { idx } = state as { idx: unknown };
    return { idx: typeof idx === 'number' ? idx : null };
  }
  return { idx: null };
};

const Repro = () => {
  // The write under test: push a history entry and tell react-router about it.
  const [modal, setModal] = useQueryState(
    'm',
    parseAsString.withOptions({ history: 'push', shallow: false }),
  );
  const location = useLocation();
  const navigate = useNavigate();
  const [readings, setReadings] = useState<Reading[]>([]);

  const record = (label: string) => {
    const { idx } = readHistoryState();
    setReadings((previous) => [
      ...previous,
      {
        label,
        href: window.location.pathname + window.location.search,
        historyLength: window.history.length,
        idx,
        key: location.key,
      },
    ]);
  };

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>nuqs push / history index reproduction</h1>

      <p>
        Click the buttons in order. Every click appends a reading below.
        <br />
        <strong>Expected:</strong> opening pushes an entry, so
        <code> history.length</code> and <code>history.state.idx</code> both
        increase by one.
        <br />
        <strong>Actual:</strong> <code>history.length</code> increases and
        <code> idx</code> does not, so react-router&apos;s index no longer
        matches the browser stack.
      </p>

      <p>
        <button type="button" onClick={() => record('1. before any write')}>
          1. record baseline
        </button>{' '}
        <button
          type="button"
          onClick={() => {
            void setModal('open').then(() => {
              record('2. after push write (m=open)');
            });
          }}
        >
          2. push write: m=open
        </button>{' '}
        <button
          type="button"
          onClick={() => {
            window.history.back();
            window.setTimeout(() => {
              record('3. after history.back()');
            }, 300);
          }}
        >
          3. history.back()
        </button>{' '}
        <button
          type="button"
          onClick={() => {
            // Control: the same URL change, pushed by react-router itself.
            navigate('?m=open');
            window.setTimeout(() => {
              record('4. control: react-router push');
            }, 300);
          }}
        >
          4. control: react-router push
        </button>
      </p>

      <p>
        Current <code>m</code>: <code>{modal ?? '(unset)'}</code>
      </p>

      <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">step</th>
            <th align="left">url</th>
            <th align="left">history.length</th>
            <th align="left">history.state.idx</th>
            <th align="left">location.key</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading, index) => (
            <tr key={`${reading.label}-${String(index)}`}>
              <td>{reading.label}</td>
              <td>
                <code>{reading.href}</code>
              </td>
              <td>{reading.historyLength}</td>
              <td>{reading.idx === null ? 'none' : reading.idx}</td>
              <td>
                <code>{reading.key}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <StrictMode>
    <BrowserRouter>
      <NuqsAdapter>
        <Repro />
      </NuqsAdapter>
    </BrowserRouter>
  </StrictMode>,
);
