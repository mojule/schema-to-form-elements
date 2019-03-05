import { JSONSchema4 } from 'json-schema';
import { Templates } from './types';
export declare const SchemaToFormElements: (document: Document, templates?: Partial<Templates>) => (schema: JSONSchema4, name?: string, value?: any) => HTMLElement;
