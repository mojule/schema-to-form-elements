import { JSONSchema4 } from 'json-schema';
export declare type SchemaTemplate = (schema: JSONSchema4, name?: string, value?: any, isRequired?: boolean) => HTMLElement;
export interface Templates {
    array: SchemaTemplate;
    boolean: SchemaTemplate;
    number: SchemaTemplate;
    object: SchemaTemplate;
    string: SchemaTemplate;
    [name: string]: SchemaTemplate;
}
export interface StringFormatTemplates extends Partial<Templates> {
    string: SchemaTemplate;
}
export declare type StringTemplateFactory = (document: Document, isMultiline?: boolean) => SchemaTemplate;
