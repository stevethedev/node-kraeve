/**
 * Kraeve
 *
 * @author Steven Jimenez <steven@stevethedev.com>
 */
'use strict';

const { basename, dirname, join, sep, resolve } = require('path');

const fs          = require('fs');
const Module      = require('module');
const rootDir     = dirname(require.main.filename);

const { moduleName, modulePath } = getModuleName('app');
const baseRequire = Module.prototype.require;

/**
 * Overwrite the require() function with a "binary-compatible" replacement
 * which also respects the current directory.
 *
 * @method require
 *
 * @param {String}   requirePath - The normal "require" input
 * @param {...Mixed} args        - Any additional parameters that get passed to
 *                                 custom require() functions
 *
 * @return {Mixed} The normal response from a require() call
 */
Module.prototype.require = function(requirePath, ...args) {
    requirePath = requirePath.split('/');
    if (moduleName === requirePath[0]) {
        requirePath[0] = modulePath;
    }
    return baseRequire.call(this, join(...requirePath), ...args);
};

/**
 * Get the module name from the nearest package.json file
 *
 * @method getModuleName
 *
 * @return {String}
 */
function getModuleName(defaultName) {
    let moduleName = defaultName;
    let pkg = null;

    let modulePath = dirname(require.main.filename);
    let lastPath   = null;
    while (lastPath !== modulePath) {
        if (fs.existsSync(join(modulePath, 'package.json'))) {
            const pkg = require(join(modulePath, 'package.json'));
            moduleName = pkg.name || basename(modulePath);
            break;
        }
        lastPath = modulePath;
        modulePath = resolve(join(modulePath, '..'));
    }

    return { moduleName, modulePath };
}
