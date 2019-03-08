export declare const document: Document, FormData: {
    new (form?: HTMLFormElement | undefined): FormData;
    prototype: FormData;
}, Event: {
    new (type: string, eventInitDict?: EventInit | undefined): Event;
    prototype: Event;
    readonly AT_TARGET: number;
    readonly BUBBLING_PHASE: number;
    readonly CAPTURING_PHASE: number;
    readonly NONE: number;
};
export declare const form: (attributes?: {
    [key: string]: any;
}, ...children: Node[]) => HTMLFormElement;
