import { useEffect, useRef, useState } from 'react';
import { Pane } from 'tweakpane';
import { useDebugMode } from './DebugModeContext';

type TweakpaneParams = Record<string, number | boolean | string>;
type BindingOptions = Record<string, Record<string, unknown>>;

/**
 * Creates a Tweakpane panel scoped to the calling prototype.
 *
 * - By default, the panel is shown/hidden based on global debug mode (toggled via ⌘K).
 * - Pass `alwaysVisible: true` to show the panel regardless of debug mode.
 * - Pass `debugParams` + `debugBindingOptions` to add extra bindings that only appear
 *   in debug mode. The pane is recreated (not just shown/hidden) when debug mode
 *   toggles so the binding list can change. Values are preserved across recreations.
 *
 * @param initialParams       - Always-visible parameter values.
 * @param bindingOptions      - Optional per-key Tweakpane binding options.
 * @param hookOptions         - Optional hook-level options.
 *
 * @example
 * const { params } = useTweakpane(
 *   { App: 'IAM Dashboard' },
 *   { App: { options: { 'IAM Dashboard': 'IAM Dashboard', 'Spark': 'Spark' } } },
 *   {
 *     alwaysVisible: true,
 *     debugParams: { navLayout: 'left-panel', isAdmin: true },
 *     debugBindingOptions: { navLayout: { options: { 'Top Nav': 'top-nav', 'Left Panel': 'left-panel' } } },
 *   },
 * );
 */
export function useTweakpane<
    T extends TweakpaneParams,
    D extends TweakpaneParams = Record<string, never>,
>(
    initialParams: T,
    bindingOptions?: BindingOptions,
    hookOptions?: {
        alwaysVisible?: boolean;
        debugParams?: D;
        debugBindingOptions?: BindingOptions;
    },
): { params: T & D } {
    const alwaysVisible = hookOptions?.alwaysVisible ?? false;
    const hasDebugParams = !!hookOptions?.debugParams;

    // Stable refs for the initial shape (never updated)
    const initialParamsRef = useRef<T>(initialParams);
    const initialDebugParamsRef = useRef<D>((hookOptions?.debugParams ?? {}) as D);

    // Mutable value stores that survive pane recreation
    const baseValuesRef = useRef<T>({ ...initialParams });
    const debugValuesRef = useRef<D>({ ...(hookOptions?.debugParams ?? {}) } as D);

    const [params, setParams] = useState<T & D>(() => ({
        ...initialParams,
        ...(hookOptions?.debugParams ?? {}),
    } as T & D));

    const paneRef = useRef<Pane | null>(null);
    const { debugMode } = useDebugMode();

    // Extract drag-attach logic so it can be reused across both effects
    function attachDrag(pane: Pane): () => void {
        const container = pane.element.parentElement;
        if (container) container.style.zIndex = '9999';

        const titleBar = pane.element.querySelector<HTMLElement>('.tp-rotv_b');
        if (!titleBar || !container) return () => {};

        titleBar.style.cursor = 'grab';

        const onMouseDown = (e: MouseEvent) => {
            if (!container.style.left) {
                const rect = container.getBoundingClientRect();
                container.style.right = 'auto';
                container.style.left = `${rect.left}px`;
                container.style.top = `${rect.top}px`;
            }

            const originX = e.clientX;
            const originY = e.clientY;
            const startX = e.clientX - container.getBoundingClientRect().left;
            const startY = e.clientY - container.getBoundingClientRect().top;
            let didDrag = false;
            titleBar.style.cursor = 'grabbing';

            const onMouseMove = (mv: MouseEvent) => {
                if (!didDrag && Math.hypot(mv.clientX - originX, mv.clientY - originY) < 4) return;
                didDrag = true;
                const x = Math.max(0, Math.min(mv.clientX - startX, window.innerWidth - container.offsetWidth));
                const y = Math.max(0, Math.min(mv.clientY - startY, window.innerHeight - container.offsetHeight));
                container.style.left = `${x}px`;
                container.style.top = `${y}px`;
            };

            const onMouseUp = () => {
                titleBar.style.cursor = 'grab';
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                if (didDrag) {
                    const suppressClick = (ce: MouseEvent) => {
                        ce.stopPropagation();
                        titleBar.removeEventListener('click', suppressClick, true);
                    };
                    titleBar.addEventListener('click', suppressClick, true);
                }
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        titleBar.addEventListener('mousedown', onMouseDown);
        return () => titleBar.removeEventListener('mousedown', onMouseDown);
    }

    // ── Case A: no debugParams — create once, show/hide on debug mode ──────────
    useEffect(() => {
        if (hasDebugParams) return;

        const pane = new Pane({ title: 'Parameters', expanded: true });
        paneRef.current = pane;

        for (const key of Object.keys(initialParamsRef.current)) {
            const opts = bindingOptions?.[key] ?? {};
            const binding = pane.addBinding(baseValuesRef.current, key as keyof T & string, opts);
            binding.on('change', (ev: { value: T[keyof T] }) => {
                baseValuesRef.current = { ...baseValuesRef.current, [key]: ev.value };
                setParams({ ...baseValuesRef.current } as T & D);
            });
        }

        pane.element.style.display = (alwaysVisible || debugMode) ? '' : 'none';
        const cleanupDrag = attachDrag(pane);

        return () => {
            cleanupDrag();
            pane.dispose();
            paneRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Show/hide without recreation (Case A only)
    useEffect(() => {
        if (hasDebugParams || !paneRef.current) return;
        if (!alwaysVisible) {
            paneRef.current.element.style.display = debugMode ? '' : 'none';
        }
    }, [debugMode, alwaysVisible, hasDebugParams]);

    // ── Case B: debugParams present — recreate pane when debug mode changes ────
    useEffect(() => {
        if (!hasDebugParams) return;

        if (paneRef.current) {
            paneRef.current.dispose();
            paneRef.current = null;
        }

        const pane = new Pane({ title: 'Parameters', expanded: true });
        paneRef.current = pane;

        // Always-visible base bindings
        for (const key of Object.keys(initialParamsRef.current)) {
            const opts = bindingOptions?.[key] ?? {};
            const binding = pane.addBinding(baseValuesRef.current, key as keyof T & string, opts);
            binding.on('change', (ev: { value: unknown }) => {
                baseValuesRef.current = { ...baseValuesRef.current, [key]: ev.value as T[keyof T] };
                setParams({ ...baseValuesRef.current, ...debugValuesRef.current } as T & D);
            });
        }

        // Debug-only bindings
        if (debugMode) {
            for (const key of Object.keys(initialDebugParamsRef.current)) {
                const opts = hookOptions?.debugBindingOptions?.[key] ?? {};
                const binding = pane.addBinding(debugValuesRef.current, key as keyof D & string, opts);
                binding.on('change', (ev: { value: unknown }) => {
                    debugValuesRef.current = { ...debugValuesRef.current, [key]: ev.value as D[keyof D] };
                    setParams({ ...baseValuesRef.current, ...debugValuesRef.current } as T & D);
                });
            }
        }

        pane.element.style.display = (alwaysVisible || debugMode) ? '' : 'none';
        const cleanupDrag = attachDrag(pane);

        return () => {
            cleanupDrag();
            pane.dispose();
            paneRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debugMode]);

    return { params };
}
