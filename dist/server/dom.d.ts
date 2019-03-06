export declare const document: Document, FormData: {
    new (form?: HTMLFormElement | undefined): FormData;
    prototype: FormData;
};
export declare const getEntries: (form: HTMLFormElement) => string[][];
export declare const form: (attributes?: {
    [key: string]: any;
}, ...children: Node[]) => HTMLFormElement;
