import { useCallback, useEffect, useState } from 'react';
import { onDataChange } from '../services/storageService.js';

/**
 * Runs an async loader and re-runs it whenever stored data changes.
 * @returns {{ data, loading, error, reload }}
 */
export function useStore(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);
  const reload = useCallback(() => {
    let alive = true;
    run()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: null, loading: false, error }));
    return () => {
      alive = false;
    };
  }, [run]);
  useEffect(() => {
    const cancel = reload();
    const off = onDataChange(reload);
    return () => {
      cancel();
      off();
    };
  }, [reload]);
  return { ...state, reload };
}
