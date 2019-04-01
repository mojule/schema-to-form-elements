import { SchemaTemplate } from '../../types';
import { JSONSchema4 } from 'json-schema';
export declare const ConstDecorator: (_document: Document, stringOrNumberTemplate: SchemaTemplate) => (schema?: JSONSchema4, name?: string, value?: string | number | undefined, isRequired?: boolean) => HTMLElement;
