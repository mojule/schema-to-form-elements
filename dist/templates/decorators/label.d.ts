import { JSONSchema4 } from 'json-schema';
import { SchemaTemplate } from '../../types';
export declare const LabelDecorator: (document: Document, inputTemplate: SchemaTemplate, isSuffix?: boolean) => (schema?: JSONSchema4, name?: string, value?: any, isRequired?: boolean) => HTMLElement;
