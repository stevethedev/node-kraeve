/**
 * Kraeve
 *
 * @author Steven Jimenez <steven@stevethedev.com>
 */
'use strict';

const { basename, dirname, join, sep, resolve } = require('path');

const fs          = require('fs');
const Module      = require('module');
const rootDir     = (require.main && require.main.filename)
    ? dirname(require.main.filename)
    : global.process.cwd();

const { moduleName, modulePath } = getModuleName('app');
const baseRequire = Module.prototype.require;
const { _resolveFilename } = Module;

/**
 * Overwrite the require() function with a "binary-compatible" replacement
 * which also respects the application directory.
 *
 * @method require
 *
 * @param {String}   path - The normal "require" input
 * @param {...Mixed} args - Any additional parameters that get passed to
 *                          custom require() functions
 *
 * @return {Mixed} The normal response from a require() call
 */
Module.prototype.require = function(path, ...args) {
    return baseRequire.call(this, getModulePath(path), ...args);
};

/**
 * Overwrite the require.resolve() function with a "binary-compatible"
 * replacement which also respects the application directory.
 *
 * @param  {String}   request
 * @param  {...Mixed} args
 *
 * @return {String}
 */
Module._resolveFilename = function(request, ...args) {
    return _resolveFilename.call(this, getModulePath(request), ...args);
};

/**
 * Get the path to the application.
 *
 * @param  {String} path
 * @return {String}
 */
function getModulePath(path) {
    const requirePath = path.split('/');
    const requireName = requirePath.shift();
    if (moduleName === requireName) {
        requirePath.unshift(modulePath)
        path = join(...requirePath);
    }
    return path;
}

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

    let modulePath = rootDir;
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
