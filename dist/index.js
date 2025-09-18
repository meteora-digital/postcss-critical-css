"use strict";

var _chalk = require("chalk");
var _postcss = _interopRequireDefault(require("postcss"));
var _cssnano = _interopRequireDefault(require("cssnano"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _path = _interopRequireDefault(require("path"));
var _getCriticalRules = require("./getCriticalRules");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Clean the original root node passed to the plugin, removing custom atrules,
 * properties. Will additionally delete nodes as appropriate if
 * `preserve === false`.
 *
 * @param {Object} root The root PostCSS object.
 * @param {boolean} preserve Preserve identified critical CSS in the root?
 */
function clean(root, preserve) {
  root.walkAtRules("critical", function (atRule) {
    if (preserve === false) {
      if (atRule.nodes && atRule.nodes.length) {
        atRule.remove();
      } else {
        root.removeAll();
      }
    } else {
      if (atRule.nodes && atRule.nodes.length) {
        atRule.replaceWith(atRule.nodes);
      } else {
        atRule.remove();
      }
    }
  });
  // @TODO `scope` Makes this kind of gnarly. This could be cleaned up a bit.
  root.walkDecls(/critical-(selector|filename)/, function (decl) {
    if (preserve === false) {
      if (decl.value === "scope") {
        root.walk(function (node) {
          if (node.selector && node.selector.indexOf(decl.parent.selector) === 0) {
            if (node.parent && hasNoOtherChildNodes(node.parent.nodes, node)) {
              node.parent.remove();
            } else {
              node.remove();
            }
          }
        });
      }
      var wrapper = null;
      if (decl && decl.parent) {
        wrapper = decl.parent.parent;
        decl.parent.remove();
      }
      // If the wrapper has no valid child nodes, remove it entirely.
      if (wrapper && wrapper.nodes && typeof wrapper.remove === "function" && hasNoOtherChildNodes(wrapper.nodes, decl)) {
        wrapper.remove();
      }
    } else {
      decl.remove();
    }
  });
}

/**
 * Do a dry run, console.log the output.
 *
 * @param {string} css CSS to output.
 */
function doDryRun(css) {
  console.log(
  // eslint-disable-line no-console
  (0, _chalk.green)("Critical CSS result is: ".concat((0, _chalk.yellow)(css))));
}

/**
 * Do a dry run, or write a file.
 *
 * @param {bool} dryRun Do a dry run?
 * @param {string} filePath Path to write file to.
 * @param {Object} result PostCSS root object.
 * @return {Promise} Resolves with writeCriticalFile or doDryRun function call.
 */
function dryRunOrWriteFile(dryRun, filePath, result) {
  var css = result.css;
  return new Promise(function (resolve) {
    return resolve(dryRun ? doDryRun(css) : writeCriticalFile(filePath, css));
  });
}

/**
 * Confirm a node has no child nodes other than a specific node.
 *
 * @param {array} nodes Nodes array to check.
 * @param {Object} node Node to check.
 * @return {boolean} Whether or not the node has no other children.
 */
function hasNoOtherChildNodes() {
  var nodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _postcss["default"].root();
  return nodes.filter(function (child) {
    return child !== node;
  }).length === 0;
}

/**
 * Write a file containing critical CSS.
 *
 * @param {string} filePath Path to write file to.
 * @param {string} css CSS to write to file.
 */
function writeCriticalFile(filePath, css) {
  _fsExtra["default"].outputFile(filePath, css, {
    flag: "w"
  }, function (err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
}

/**
 * Primary plugin function.
 *
 * @param {object} options Object of function args.
 * @return {function} function for PostCSS plugin.
 */
function buildCritical() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var filteredOptions = Object.keys(options).reduce(function (acc, key) {
    return typeof options[key] !== "undefined" ? _objectSpread(_objectSpread({}, acc), {}, _defineProperty({}, key, options[key])) : acc;
  }, {});
  var args = _objectSpread({
    outputPath: process.cwd(),
    outputDest: "critical.css",
    preserve: true,
    minify: true,
    dryRun: false
  }, filteredOptions);
  return function (css) {
    var dryRun = args.dryRun,
      preserve = args.preserve,
      minify = args.minify,
      outputPath = args.outputPath,
      outputDest = args.outputDest;
    var criticalOutput = (0, _getCriticalRules.getCriticalRules)(css, outputDest);
    return Object.keys(criticalOutput).reduce(function (init, cur) {
      var criticalCSS = _postcss["default"].root();
      var filePath = _path["default"].join(outputPath, cur);
      criticalOutput[cur].each(function (rule) {
        return criticalCSS.append(rule.clone());
      });
      return (0, _postcss["default"])(minify ? [_cssnano["default"]] : [])
      // @TODO Use from/to correctly.
      .process(criticalCSS, {
        from: undefined
      }).then(dryRunOrWriteFile.bind(null, dryRun, filePath)).then(clean.bind(null, css, preserve));
    }, {});
  };
}
module.exports = buildCritical;