import { JSONSchema4 } from 'json-schema';
import { Templates } from '../types';
export declare const ArrayItemTemplate: (document: Document, templates?: Partial<Templates>) => (schema: JSONSchema4, name?: string, value?: any[] | undefined) => HTMLLIElement;