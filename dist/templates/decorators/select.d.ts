import { SchemaTemplate } from '../../types';
import { JSONSchema4 } from 'json-schema';
export declare const SelectDecorator: (document: Document, stringTemplate: SchemaTemplate) => (schema?: JSONSchema4, name?: string, value?: string | undefined, isRequired?: boolean) => HTMLElement;
