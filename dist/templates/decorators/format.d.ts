import { StringFormatTemplates } from '../../types';
import { JSONSchema4 } from 'json-schema';
export declare const FormatDecorator: (_document: Document, stringTemplates: StringFormatTemplates, formatToTemplateKey?: Map<string, string>, formatToTypeAttribute?: Map<string, string>) => (schema?: JSONSchema4, name?: string, value?: any[] | undefined, isRequired?: boolean) => HTMLElement;
export declare const defaultFormatToType: Map<string, string>;
