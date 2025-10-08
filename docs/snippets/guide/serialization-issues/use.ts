import { parse, stringify } from 'json-serialization';
import { binarySerializer, binaryDeserializer } from '@json-serialization/binary';
import { errorSerializer, errorDeserializer } from '@json-serialization/error';
import { createFunctionSerDes } from '@json-serialization/function';

var basicChannel: {
    onmessage?: (data: string) => void;
    postMessage: (data: string) => void;
};

var channel: {
    onmessage?: (data: any) => void;
    postMessage: (data: any) => void;
} = {
    async postMessage(data: any) {
        basicChannel.postMessage(await stringify(data, [binarySerializer, errorSerializer, functionSerDes.serializer]));
    },
};

basicChannel.onmessage = async (data: string) => {
    channel?.onmessage?.(await parse(data, [binaryDeserializer, errorDeserializer, functionSerDes.deserializer]));
};

var functionSerDes = createFunctionSerDes(channel);
