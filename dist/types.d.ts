import { JSONSchema4 } from 'json-schema';
export declare type Template<T = HTMLElement> = (schema: JSONSchema4) => T;
export declare type TemplateFactory<T = HTMLElement> = (document: Document, dependencies?: Partial<Templates>) => Template<T>;
export interface Templates {
    container: Template;
    input: Template<HTMLInputElement>;
    [name: string]: Template;
}
export declare type ElementDecorator = (element: HTMLElement) => HTMLElement;
export declare type ElementDecoratorFactory = (document: Document) => ElementDecorator;
