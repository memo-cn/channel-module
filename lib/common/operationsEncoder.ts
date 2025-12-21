import { createObjectEncoder } from 'object-encoder';
import { Operation } from './operation';
import { operationsSet } from '../client/proxy/basic-constructor';

type Source = Operation[];
type PlainObject = {
    length: number;
    [index: number]: Operation;
};

export const operationsEncoder = createObjectEncoder<Source, PlainObject>({
    typeTag: {
        key: '$type:Operations',
        value: 1,
        escapeCharacter: '_',
    },
    isSource,
    toPlainObject,
    fromPlainObject,
});

function isSource(value: any): boolean {
    if (Object(value) !== value) return false;
    return operationsSet.has(value);
}

function toPlainObject(source: Source): PlainObject {
    const ret: PlainObject = {
        length: source.length,
    };
    for (let i = 0; i < source.length; i++) {
        ret[i] = source[i];
    }
    return ret;
}

function fromPlainObject(plainObject: PlainObject): Source {
    return Array.from(plainObject);
}
