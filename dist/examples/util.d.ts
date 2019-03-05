import { DOMWindow } from 'jsdom';
export declare const getEntries: (window: DOMWindow, element: HTMLElement) => string[][];
export declare const keyToJsonPointer: (key: string) => string;
export declare const entriesToPointers: (entries: string[][]) => string[][];
