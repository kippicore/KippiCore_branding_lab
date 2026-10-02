import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLabState } from '../lib/url-state';
import { PALETTES } from '../data/palettes';
import { TYPE_SYSTEMS } from '../data/typography';
import { ATMOSPHERES } from '../layers/atmospheres';
import { GLASSES } from '../layers/glass';
import { Combinador } from '../views/Combinador/Combinador';
import { Galerias } from '../views/Galerias/Galerias';
import { Ficha } from '../views/Ficha/Ficha';
import { Snapshot } from '../views/Snapshot/Snapshot';
import { Shell, HelpDialog } from './Shell';
import { handleShortcutEvent, type ShortcutLists } from './shortcuts';

const isSnapshot = (): boolean => new URLSearchParams(window.location.search).get('view') === 'snap';

export function App(): ReactNode {
  // La ruta de capturas no lleva interfaz ni atajos.
  return isSnapshot() ? <Snapshot /> : <Lab />;
}

function Lab(): ReactNode {
  const [state, setState] = useLabState();
  const [help, setHelp] = useState(false);
  const lists = useMemo<ShortcutLists>(() => ({
    types: TYPE_SYSTEMS.map((t) => t.id),
    palettes: PALETTES.map((p) => p.id),
    atmospheres: ATMOSPHERES.map((a) => a.id),
    glasses: GLASSES.map((g) => g.id),
  }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const r = handleShortcutEvent(e, state, lists);
      if (!r) return;
      if ('help' in r) { e.preventDefault(); setHelp((h) => !h); return; }
      if (state.view !== 'combinador') return;
      e.preventDefault();
      setState(r.patch);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, lists, setState]);

  return (
    <Shell view={state.view} onHelp={() => setHelp(true)} onNavigate={(view) => setState({ view }, { push: true })}>
      {state.view === 'combinador' && <Combinador state={state} setState={setState} />}
      {state.view === 'galerias' && <Galerias state={state} setState={setState} />}
      {state.view === 'ficha' && <Ficha state={state} setState={setState} />}
      <HelpDialog open={help} onClose={() => setHelp(false)} />
    </Shell>
  );
}
