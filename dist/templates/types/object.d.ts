import { JSONSchema4 } from 'json-schema';
import { Templates } from '../../types';
export declare const ObjectTemplate: (document: Document, templates?: Partial<Templates>) => (schema: JSONSchema4, name?: string, defaultValue?: any) => HTMLDivElement;
