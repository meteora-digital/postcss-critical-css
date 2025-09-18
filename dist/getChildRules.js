"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getChildRules = getChildRules;
var _postcss = _interopRequireDefault(require("postcss"));
var _matchChild = require("./matchChild");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
/**
 * Get rules for selectors nested within parent node
 *
 * @param {Object} PostCSS CSS object
 * @param {Object} Parent rule for which children should be included
 * @return {array} Array of child rules.
 */
function getChildRules(css, parent) {
  var result = [];
  var selectorRegExp = new RegExp(parent.selector);

  // Walk all rules to mach child selectors
  css.walkRules(selectorRegExp, function (rule) {
    var childRule = (0, _matchChild.matchChild)(parent, rule);
    if (childRule) {
      result.push(rule);
    }
  });

  // Walk all at-rules to match nested child selectors
  css.walkAtRules(function (atRule) {
    atRule.walkRules(selectorRegExp, function (rule) {
      var childRule = (0, _matchChild.matchChild)(parent, rule);
      // Create new at-rule to append only necessary selector to critical
      var criticalAtRule = _postcss["default"].atRule({
        name: atRule.name,
        params: atRule.params
      });
      /**
       * Should append even if parent selector, but make sure the two rules
       * aren't identical.
       */
      if ((rule.selector === parent.selector || childRule) && _postcss["default"].parse(rule).toString() !== _postcss["default"].parse(parent).toString()) {
        var clone = rule.clone();
        criticalAtRule.append(clone);
        result.push(criticalAtRule);
      }
    });
  });
  return result;
}