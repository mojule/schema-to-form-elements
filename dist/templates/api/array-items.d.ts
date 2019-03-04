import { Templates } from '../../types';
import { JSONSchema4 } from 'json-schema';
export declare const ArrayItemsApi: (document: Document, templates?: Partial<Templates>) => {
    arrayItemsDecorator: (schema: JSONSchema4, name?: string, defaultValue?: any[] | undefined) => HTMLElement;
    arrayItemsApi: any;
};
