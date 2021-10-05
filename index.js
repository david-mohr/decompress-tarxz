import {Buffer} from 'node:buffer';
import decompressTar from 'decompress-tar';
import FileType from 'file-type';
import {isStream} from 'is-stream';
import lzmaNative from 'lzma-native';

export default function decompress() {
	return async input => {
		const isBuffer = Buffer.isBuffer(input);
		const type = isBuffer ? await FileType.fromBuffer(input) : null;

		if (!isBuffer && !isStream(input)) {
			throw new TypeError(`Expected a Buffer or Stream, got ${typeof input}`);
		}

		if (isBuffer && (!type || type.ext !== 'xz')) {
			return [];
		}

		const decompressor = lzmaNative.createDecompressor();
		const result = decompressTar()(decompressor);

		if (isBuffer) {
			decompressor.end(input);
		} else {
			input.pipe(decompressor);
		}

		return result;
	};
}
