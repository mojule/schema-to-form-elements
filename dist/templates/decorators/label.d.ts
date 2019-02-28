import { SchemaTemplate } from '../../types';
import { JSONSchema4 } from 'json-schema';
export declare const LabelDecorator: (document: Document, template: SchemaTemplate, isSuffix?: boolean) => (schema: JSONSchema4, name?: string, defaultValue?: any[] | undefined) => HTMLElement;
