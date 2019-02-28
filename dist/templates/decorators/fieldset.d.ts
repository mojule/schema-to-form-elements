import { SchemaTemplate } from '../../types';
import { JSONSchema4 } from 'json-schema';
export declare const FieldsetDecorator: (document: Document, template: SchemaTemplate, useLegend?: boolean) => (schema: JSONSchema4, name?: string, defaultValue?: any[] | undefined) => HTMLFieldSetElement;
