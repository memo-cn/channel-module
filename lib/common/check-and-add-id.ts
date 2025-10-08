import { Channel } from './message';
import { stringifyValue } from '../utils/stringify-value';

const nameToMap: Record<string, WeakMap<Channel, Set<any>>> = {};

export function checkAndAddId(channel: Channel, id: string | number | null | undefined, name: string): void {
    const map = (nameToMap[name] = nameToMap[name] || new WeakMap<Channel, Set<any>>());
    const ids = map.get(channel) || new Set<string>();
    map.set(channel, ids);
    if (ids.has(id)) {
        let message = `When reusing a channel for ${stringifyValue(name)}, please specify a distinct id.`;
        if (id !== null && id !== void 0) {
            message += ` The id ${stringifyValue(id)} has already been used.`;
        }
        throw new Error(message);
    }
    ids.add(id);
}
