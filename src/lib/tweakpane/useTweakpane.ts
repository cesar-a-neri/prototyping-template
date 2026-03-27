import { useEffect, useRef, useState } from 'react';
import { Pane } from 'tweakpane';
import { useDebugMode } from './DebugModeContext';

type TweakpaneParams = Record<string, number | boolean | string>;
type BindingOptions = Record<string, Record<string, unknown>>;

/**
 * Creates a Tweakpane panel scoped to the calling prototype.
 * The panel is shown/hidden based on global debug mode (toggled via ⌘K).
 * The pane is destroyed when the component unmounts — no state bleeds between prototypes.
 *
 * @param initialParams - Initial parameter values.
 * @param bindingOptions - Optional per-key Tweakpane binding options (e.g. `{ myKey: { options: { A: 'a', B: 'b' } } }`).
 *
 * @example
 * const { params } = useTweakpane({ speed: 1.0, visible: true, label: 'hello' });
 * // params.speed, params.visible, params.label are reactive
 */
export function useTweakpane<T extends TweakpaneParams>(
    initialParams: T,
    bindingOptions?: BindingOptions,
): { params: T } {
    const initialParamsRef = useRef<T>(initialParams);
    const paramsRef = useRef<T>({ ...initialParams });
    const [params, setParams] = useState<T>({ ...initialParams });
    const paneRef = useRef<Pane | null>(null);
    const { debugMode } = useDebugMode();
    const debugModeRef = useRef(debugMode);
    debugModeRef.current = debugMode;

    // Create pane once on mount, destroy on unmount
    useEffect(() => {
        const pane = new Pane({ title: 'Parameters', expanded: true });
        paneRef.current = pane;

        for (const key of Object.keys(initialParamsRef.current)) {
            const opts = bindingOptions?.[key] ?? {};
            const binding = pane.addBinding(paramsRef.current, key as keyof T & string, opts);
            binding.on('change', (ev: { value: T[keyof T] }) => {
                paramsRef.current = { ...paramsRef.current, [key]: ev.value };
                setParams({ ...paramsRef.current });
            });
        }

        // Ensure the panel floats above all prototype content.
        // pane.element is .tp-rotv; the actual fixed container appended to <body> is its parent .tp-dfwv.
        const container = pane.element.parentElement;
        if (container) container.style.zIndex = '9999';

        // Apply initial visibility without a flash
        pane.element.style.display = debugModeRef.current ? '' : 'none';

        // Make the panel draggable via its title bar (.tp-rotv_b is the collapse-toggle button)
        const titleBar = pane.element.querySelector<HTMLElement>('.tp-rotv_b');
        let cleanup: (() => void) | undefined;
        if (titleBar && container) {
            titleBar.style.cursor = 'grab';

            const onMouseDown = (e: MouseEvent) => {
                // Snap from right-anchored default to explicit left/top so we can drag freely
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

                const onMouseMove = (e: MouseEvent) => {
                    if (!didDrag && Math.hypot(e.clientX - originX, e.clientY - originY) < 4) return;
                    didDrag = true;
                    const x = Math.max(0, Math.min(e.clientX - startX, window.innerWidth - container.offsetWidth));
                    const y = Math.max(0, Math.min(e.clientY - startY, window.innerHeight - container.offsetHeight));
                    container.style.left = `${x}px`;
                    container.style.top = `${y}px`;
                };

                const onMouseUp = () => {
                    titleBar.style.cursor = 'grab';
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    // Suppress the upcoming click so the pane doesn't collapse after a drag
                    if (didDrag) {
                        const suppressClick = (e: MouseEvent) => {
                            e.stopPropagation();
                            titleBar.removeEventListener('click', suppressClick, true);
                        };
                        titleBar.addEventListener('click', suppressClick, true);
                    }
                };

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            };

            titleBar.addEventListener('mousedown', onMouseDown);
            cleanup = () => titleBar.removeEventListener('mousedown', onMouseDown);
        }

        return () => {
            cleanup?.();
            pane.dispose();
            paneRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Show/hide on debug mode toggle
    useEffect(() => {
        if (paneRef.current) {
            paneRef.current.element.style.display = debugMode ? '' : 'none';
        }
    }, [debugMode]);

    return { params };
}
