import { JSONSchema4 } from 'json-schema';
export declare const StringTemplate: (document: Document, isMultiline?: boolean) => (schema: JSONSchema4, name?: string, value?: string | undefined, isRequired?: boolean) => HTMLInputElement | HTMLTextAreaElement;
