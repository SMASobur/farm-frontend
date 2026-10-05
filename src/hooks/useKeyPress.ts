import { useEffect } from 'react';

export function useKeyPress(
    key: string,
    handler: (e: KeyboardEvent) => void,
    options?: { ignoreInputs?: boolean }
) {
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (options?.ignoreInputs) {
                const target = e.target as HTMLElement;
                const tag = target?.tagName?.toLowerCase();
                if (tag === 'input' || tag === 'textarea' || target.isContentEditable) {
                    return;
                }
            }
            if (e.key === key) {
                handler(e);
            }
        };
        window.addEventListener('keydown', listener);
        return () => window.removeEventListener('keydown', listener);
    }, [key, handler, options]);
}