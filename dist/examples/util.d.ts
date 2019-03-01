import { DOMWindow } from 'jsdom';
export declare const getEntries: (window: DOMWindow, element: HTMLElement) => string[][];
export declare const keyToPointer: (key: string) => string;
export declare const entriesToPointers: (entries: string[][]) => string[][];
