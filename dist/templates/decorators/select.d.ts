import { SchemaTemplate } from '../../types';
import { JSONSchema4 } from 'json-schema';
export declare const SelectDecorator: (document: Document, stringTemplate: SchemaTemplate, predicate?: (_schema: JSONSchema4) => boolean) => (schema?: JSONSchema4, name?: string, value?: string | undefined, isRequired?: boolean) => HTMLElement;
