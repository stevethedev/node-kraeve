/**
 * @author Steven Jimenez <steven@stevethedev.com>
 */
'use strict';

const assert = require('assert');

function test(name, fn) {
    if (!test.success) {
        test.success = 0;
    }

    if (!test.failure) {
        test.failure = 0;
    }

    process.stdout.write(`${test.success + test.failure + 1}. ${name}...`);
    try {
        fn();
        process.stdout.write('\x1b[32mSUCCESS');
        test.success++;
    } catch (error) {
        process.stdout.write('\x1b[31mFAILURE\n');
        process.stderr.write(`\n${error.stack}\n`);
        process.exitCode = 1;
        test.failure++;
    }
    process.stdout.write('\x1b[0m\n');
}

test('Kraeve auto-detects module', () => {
    const kraeve = require('../index.js');
    assert.equal(require('kraeve'), kraeve);
});

test('Kraeve can add new pseudo-modules', () => {
    const kraeve = require('../index.js');
    kraeve.set('kraeve-test', '.');
    assert.equal(require('kraeve-test/test/test.js'), module.exports);
});

process.stdout.write(
    `\n${test.success}/${test.success + test.failure} (${
        (((test.success / (test.success + test.failure)) * 1000) | 0) / 10
    }%) Tests Passed\n\n`);
