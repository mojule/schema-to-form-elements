import { JSONSchema4 } from 'json-schema';
import { Templates } from '../types';
export declare const ArrayItemsTemplate: (document: Document, templates?: Partial<Templates>, initialCount?: number | undefined) => (schema: JSONSchema4, name?: string, defaultValue?: any[] | undefined) => HTMLDivElement;
