/**
 * App — Root component.
 * Intentionally minimal: just mounts MapShell.
 * All layout, state, and routing happens inside the shell.
 */
import MapShell from './components/layout/MapShell/MapShell';

function App() {
  return <MapShell />;
}

export default App;
