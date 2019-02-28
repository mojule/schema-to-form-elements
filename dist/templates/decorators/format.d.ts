import { SchemaTemplate } from '../../types';
import { JSONSchema4 } from 'json-schema';
export declare const FormatDecorator: (_document: Document, stringTemplate: SchemaTemplate, multilineTemplate: SchemaTemplate, formatToType?: Map<string, string>) => (schema: JSONSchema4, name?: string, defaultValue?: any[] | undefined) => HTMLElement;
export declare const defaultFormatToType: Map<string, string>;
