import { JSONSchema4 } from 'json-schema';
import { Templates } from '../../types';
export declare const ArrayTemplate: (document: Document, templates: Templates) => (schema: JSONSchema4, name?: string, defaultValue?: any[] | undefined) => HTMLElement;
