import { JSONSchema4 } from 'json-schema';
import { Templates, SchemaTemplate } from '../../types';
export declare const MutableArrayList: (document: Document, arrayList: SchemaTemplate, arrayItem: SchemaTemplate, templates?: Partial<Templates>) => {
    mutableArrayListDecorator: (schema: JSONSchema4, name?: string, value?: any[] | undefined) => HTMLElement;
    mutableArrayItemDecorator: (schema: JSONSchema4, name?: string, value?: any) => HTMLElement;
};
