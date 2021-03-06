/**
 * Kraeve
 *
 * @author Steven Jimenez <steven@stevethedev.com>
 */
'use strict';

const { basename, dirname, join, normalize, resolve } = require('path');

const fs          = require('fs');
const Module      = require('module');
const rootDir     = (require.main && require.main.filename)
    ? dirname(require.main.filename)
    : global.process.cwd();

const requireModules = new Map();

const { moduleName, modulePath } = getModuleName('app');
const baseRequire = Module.prototype.require;
const { _resolveFilename } = Module;

requireModules.set(moduleName, modulePath);
setParentModules();

/**
 * Checks whether this is being run from within a node_modules folder, and
 * climbs the tree to include the parent file. This addresses an issue where
 * Mocha would take ownership of the Kraeve primary directory.
 *
 * @method setParentModules
 */
function setParentModules() {
    let modPath = modulePath.split('/');
    if (modPath.includes('node_modules')) {
        modPath.splice(modPath.indexOf('node_modules'));
    }
    const { moduleName:modName } = getModuleName(
        modPath[modPath.length - 1],
        modPath = modPath.join('/'),
    );
    requireModules.set(modName, modPath);
}

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
    if (requireModules.has(requireName)) {
        requirePath.unshift(requireModules.get(requireName));
        path = join(...requirePath);
    }
    return path;
}

/**
 * Get the module name from the nearest package.json file
 *
 * @method getModuleName
 *
 * @param {String} defaultName
 *
 * @return {String}
 */
function getModuleName(defaultName, modulePath = rootDir) {
    let moduleName = defaultName;
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

class Kraeve {
    /**
     * Check wither a pseudo-module is loaded.
     *
     * @param {String} moduleName
     *
     * @return {Boolean}
     */
    has(moduleName) {
        return requireModules.has(moduleName);
    }

    /**
     * Get the path to a pseudo-module
     *
     * @param {String} moduleName
     *
     * @return {String}
     */
    get(moduleName) {
        return requireModules.get(moduleName);
    }

    /**
     * Add a path to a pseudo-module
     *
     * @param {String} moduleName   - The name of the module
     * @param {String} modulePath   - The path to the module
     * @param {String} [rootModule] - The parent to read the module from
     */
    set(moduleName, modulePath, rootModule = null) {
        if (rootModule) {
            modulePath = join(
                dirname(
                    require.resolve(rootModule)
                ),
                modulePath
            );
        }

        modulePath = resolve(modulePath);
        if (fs.lstatSync(modulePath).isFile()) {
            modulePath = dirname(modulePath);
        }
        requireModules.set(moduleName, modulePath);
        return this;
    }
}

module.exports = new Kraeve();
