import { JSONSchema4 } from 'json-schema';
import { Templates } from '../../types';
export declare const ArrayTemplate: (document: Document, templates?: Partial<Templates>) => (schema: JSONSchema4, name?: string, value?: any[] | undefined) => HTMLElement;
