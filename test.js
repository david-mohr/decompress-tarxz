import {promisify} from 'node:util';
import fs from 'node:fs';
import test from 'ava';
import isJpg from 'is-jpg';
import decompressTarxz from './index.js';

const readFileP = promisify(fs.readFile);

test('extract file', async t => {
	const buf = await readFileP('fixture.tar.xz');
	const files = await decompressTarxz()(buf);

	t.is(files[0].path, 'test.jpg');
	t.true(isJpg(files[0].data));
});

test('extract file using streams', async t => {
	const stream = fs.createReadStream('fixture.tar.xz');
	const files = await decompressTarxz()(stream);

	t.is(files[0].path, 'test.jpg');
	t.true(isJpg(files[0].data));
});

test('return empty array if non-valid file is supplied', async t => {
	const buf = await readFileP('test.js');
	const files = await decompressTarxz()(buf);

	t.is(files.length, 0);
});

test('throw on wrong input', async t => {
	await t.throwsAsync(decompressTarxz()('foo'), {
		instanceOf: TypeError,
		message: 'Expected a Buffer or Stream, got string',
	});
});
