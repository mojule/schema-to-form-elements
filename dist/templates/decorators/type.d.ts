import { JSONSchema4 } from 'json-schema';
import { SchemaTemplate } from '../../types';
export declare const TypeDecorator: (_document: Document, inputTemplate: SchemaTemplate) => (schema?: JSONSchema4, name?: string, value?: any[] | undefined, isRequired?: boolean) => HTMLElement;
