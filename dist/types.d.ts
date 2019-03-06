import { JSONSchema4 } from 'json-schema';
export declare type SchemaTemplateFactory = (document: Document, ...deps: any[]) => SchemaTemplate;
export declare type ContainerTemplateFactory = (document: Document, templates?: Partial<Templates>) => SchemaTemplate;
export declare type PrimitiveTemplateFactory = (document: Document) => SchemaTemplate;
export declare type NumberTemplateFactory = (document: Document, isRange?: boolean) => SchemaTemplate;
export declare type StringTemplateFactory = (document: Document, isMultiline?: boolean) => SchemaTemplate;
export declare type SchemaTemplate = (schema: JSONSchema4, name?: string, value?: any, isRequired?: boolean) => HTMLElement;
export interface Templates {
    array: SchemaTemplate;
    boolean: SchemaTemplate;
    number: SchemaTemplate;
    integer: SchemaTemplate;
    object: SchemaTemplate;
    string: SchemaTemplate;
    [name: string]: SchemaTemplate;
}
export interface StringFormatTemplates extends Partial<Templates> {
    string: SchemaTemplate;
}
