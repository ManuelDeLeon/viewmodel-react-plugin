'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var lazyCounter = 1;

var isString = function isString(str) {
  return typeof str === 'string' || str instanceof String;
};
var reactStyle = function reactStyle(str) {
  if (!~str.indexOf('-')) return str;
  var retVal = "";
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = str.split('-')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var block = _step.value;

      if (!block) continue;
      if (!retVal && (block.toLowerCase() === "ms" || str.substr(0, 1) !== "-")) {
        retVal += block.toLowerCase();
      } else {
        retVal += block[0].toUpperCase() + block.substr(1).toLowerCase();
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return retVal;
};

var getVmCallExpression = function getVmCallExpression(isLoop, bindingObject, path, t, method) {
  var memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier(method), false);
  var repeatObject = !isLoop && (bindingObject.repeat || path.scope.hasBinding('repeatObject')) ? t.identifier('repeatObject') : t.nullLiteral();
  var repeatIndex = !isLoop && (bindingObject.repeat || path.scope.hasBinding('repeatIndex')) ? t.identifier('repeatIndex') : t.nullLiteral();

  for (var _len = arguments.length, params = Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {
    params[_key - 5] = arguments[_key];
  }

  params.unshift(t.thisExpression(), repeatObject, repeatIndex);
  var callExpression = t.callExpression(memberExpression, params);
  return callExpression;
};

var getVmCall = function getVmCall(isLoop, bindingObject, path, t, method) {
  for (var _len2 = arguments.length, params = Array(_len2 > 5 ? _len2 - 5 : 0), _key2 = 5; _key2 < _len2; _key2++) {
    params[_key2 - 5] = arguments[_key2];
  }

  var callExpression = getVmCallExpression.apply(undefined, [isLoop, bindingObject, path, t, method].concat(params));
  var jsxExpressionContainer = t.jSXExpressionContainer(callExpression);
  return jsxExpressionContainer;
};

var getDisabled = function getDisabled(isEnabled) {
  return {
    process: function process(bindText, attributePath, t, binding, bindingObject) {
      var openingElementPath = attributePath.parentPath;

      var styleIndex = -1;
      var found = false;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = openingElementPath.node.attributes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var attr = _step2.value;

          styleIndex++;
          if (attr.name.name === 'disabled') {
            found = true;
            break;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var jSXExpressionContainer = getVmCall(false, bindingObject, attributePath, t, 'getDisabled', t.booleanLiteral(isEnabled), t.stringLiteral(bindText));
      var jSXAttribute = t.jSXAttribute(t.jSXIdentifier('disabled'), jSXExpressionContainer);

      if (found) {
        openingElementPath.node.attributes.splice(styleIndex, 1);
      }
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  };
};

var bad = {
  start: 1, end: 1, loc: 1
};
function dump(arr, level) {
  var dumped_text = "";
  if (!level) level = 0;

  var level_padding = "";
  for (var j = 0; j < level + 1; j++) {
    level_padding += "  ";
  }if ((typeof arr === 'undefined' ? 'undefined' : _typeof(arr)) == 'object') {
    for (var item in arr) {
      if (bad[item]) continue;
      var value = arr[item];

      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
        dumped_text += level_padding + "'" + item + "' ...\n";
        dumped_text += dump(value, level + 1);
      } else {
        if (item[0] !== '_') {
          dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
        }
      }
    }
  } else {
    dumped_text = "===>" + arr + "<===(" + (typeof arr === 'undefined' ? 'undefined' : _typeof(arr)) + ")";
  }
  return dumped_text;
};

function clean(obj) {

  for (var item in obj) {
    if (bad[item]) delete obj[item];

    var value = obj[item];

    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
      clean(value);
    }
  }
};

var bindings = {
  text: {
    process: function process(bindText, attributePath, t, binding, bindingObject) {
      var elementPath = attributePath.parentPath.parentPath;
      var jsxExpressionContainer = getVmCall(false, bindingObject, attributePath, t, 'getValue', t.stringLiteral(bindText));
      if (elementPath.node.type === 'JSXExpressionContainer') {
        elementPath.node.expression.arguments[0].body.body[0].argument.children.push(jsxExpressionContainer);
      } else {
        elementPath.node.children.push(jsxExpressionContainer);
      }
    }
  },
  html: {
    process: function process(bindText, attributePath, t, binding, bindingObject) {
      var callExpression = getVmCallExpression(false, bindingObject, attributePath, t, 'getValue', t.stringLiteral(bindText));
      var objectProperty = t.objectProperty(t.identifier('__html'), callExpression);
      var objectExpression = t.objectExpression([objectProperty]);
      var jsxExpressionContainer = t.jSXExpressionContainer(objectExpression);
      var jsxAttribute = t.jSXAttribute(t.jSXIdentifier('dangerouslySetInnerHTML'), jsxExpressionContainer);
      var elementPath = attributePath.parentPath;
      elementPath.node.attributes.push(jsxAttribute);
    }
  },

  value: {
    process: function process(bindText, attributePath, t, binding, bindingObject) {
      var jSXExpressionContainer = getVmCall(false, bindingObject, attributePath, t, 'getValue', t.stringLiteral(bindText));
      var defaultValue = 'defaultValue';
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = attributePath.parent.attributes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var attribute = _step3.value;

          if (attribute.name.name === "type" && (attribute.value.value === "checkbox" || attribute.value.value === "radio")) {
            defaultValue = 'defaultChecked';
            break;
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var jSXAttribute = t.jSXAttribute(t.jSXIdentifier(defaultValue), jSXExpressionContainer);
      var openingElementPath = attributePath.parentPath;
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  },

  singleAttribute: {
    process: function process(bindText, attributePath, t, binding, bindingObject) {
      var jSXExpressionContainer = getVmCall(false, bindingObject, attributePath, t, 'getValue', t.stringLiteral(bindText));
      var jSXAttribute = t.jSXAttribute(t.jSXIdentifier(binding), jSXExpressionContainer);
      var openingElementPath = attributePath.parentPath;
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  },

  check: {
    process: function process(bindText, attributePath, t, binding, bindingObject) {
      var jSXExpressionContainer = getVmCall(false, bindingObject, attributePath, t, 'getValue', t.stringLiteral(bindText));
      var jSXAttribute = t.jSXAttribute(t.jSXIdentifier('defaultChecked'), jSXExpressionContainer);
      var openingElementPath = attributePath.parentPath;
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  },

  defaultBinding: {
    process: function process(bindingText, attributePath, t, binding, bindingObject) {
      var jSXExpressionContainer_ref = getVmCall(false, bindingObject, attributePath, t, 'bindElement', t.stringLiteral(bindingText));
      var jSXAttributeSet_ref = t.jSXAttribute(t.jSXIdentifier('ref'), jSXExpressionContainer_ref);
      var openingElementPath = attributePath.parentPath;
      openingElementPath.node.attributes.push(jSXAttributeSet_ref);
    }
  },

  'class': {
    process: function process(bindText, attributePath, t, binding, bindingObject) {
      var openingElementPath = attributePath.parentPath;

      var currentClasses = "";
      var found = false;
      var classIndex = -1;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = openingElementPath.node.attributes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var attr = _step4.value;

          classIndex++;
          if (attr.name.name === 'className' || attr.name.name === 'class') {
            found = true;
            currentClasses = attr.value.value;
            break;
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      var jSXExpressionContainer = getVmCall(false, bindingObject, attributePath, t, 'getClass', t.stringLiteral(currentClasses), t.stringLiteral(bindText));
      var jSXAttribute = t.jSXAttribute(t.jSXIdentifier('className'), jSXExpressionContainer);
      if (found) {
        openingElementPath.node.attributes.splice(classIndex, 1);
      }
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  },

  'unless': {
    process: function process(bindText, attributePath, t, binding, bindingObject) {
      var jSXElement = attributePath.parentPath.parent;
      var callExpression = getVmCallExpression(false, bindingObject, attributePath, t, 'getValue', t.stringLiteral(bindText));
      var unaryExpression = t.unaryExpression("!", callExpression);
      var conditionalExpression = t.conditionalExpression(unaryExpression, jSXElement, t.nullLiteral());
      var jSXExpressionContainer = t.jSXExpressionContainer(conditionalExpression);

      attributePath.parentPath.parentPath.replaceWith(jSXExpressionContainer);
    }
  },

  'style': {
    process: function process(bindText, attributePath, t, binding, bindingObject) {
      var elementPath = attributePath.parentPath;
      var node = elementPath.node;

      var currentStyle = "";
      var styleIndex = -1;
      var found = false;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = node.attributes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var attr = _step5.value;

          styleIndex++;
          if (attr.type === 'JSXAttribute' && attr.name.name === 'style') {
            found = true;
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
              for (var _iterator6 = attr.value.value.split(';')[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var inStyle = _step6.value;

                var colPos = inStyle.indexOf(':');
                var name = inStyle.substring(0, colPos).trim();
                var value = inStyle.substr(colPos + 1).trim();
                currentStyle += reactStyle(name) + ":" + value + ";";
              }
            } catch (err) {
              _didIteratorError6 = true;
              _iteratorError6 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                  _iterator6.return();
                }
              } finally {
                if (_didIteratorError6) {
                  throw _iteratorError6;
                }
              }
            }

            break;
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      var jSXExpressionContainer = getVmCall(false, bindingObject, attributePath, t, 'getStyle', t.stringLiteral(currentStyle), t.stringLiteral(bindText));
      var jSXAttribute = t.jSXAttribute(t.jSXIdentifier('style'), jSXExpressionContainer);

      if (found) {
        node.attributes.splice(styleIndex, 1);
      }
      node.attributes.push(jSXAttribute);
    }
  },

  'enable': getDisabled(true),
  'disable': getDisabled(false),
  defer: {
    getReplacement: function getReplacement(jSXElement, t, bindingObject, path, bindText) {
      var componentName = jSXElement.openingElement.name.name; // ???
      var vmLazyProp = "vmLazy" + componentName + lazyCounter++;

      var memberExpressionChange3 = t.memberExpression(t.thisExpression(), t.identifier('vmChange'));
      var callExpressionChange1 = t.callExpression(memberExpressionChange3, []);
      var arrowFunctionExpressionChange = t.arrowFunctionExpression([], callExpressionChange1);
      var memberExpressionChange2 = t.memberExpression(t.identifier('ViewModel'), t.identifier('Tracker'));
      var memberExpressionChange = t.memberExpression(memberExpressionChange2, t.identifier('afterFlush'));
      var callExpressionChange = t.callExpression(memberExpressionChange, [arrowFunctionExpressionChange]);
      var expressionStatementChange = t.expressionStatement(callExpressionChange);

      var memberExpressionAssign = t.memberExpression(t.thisExpression(), t.identifier(vmLazyProp));
      var assignmentExpression = t.assignmentExpression("=", memberExpressionAssign, jSXElement);
      var expressionStatementAssign = t.expressionStatement(assignmentExpression);

      var memberExpressionDeclaration = t.memberExpression(t.identifier("m"), t.identifier(componentName));
      var variableDeclarator = t.variableDeclarator(t.identifier(componentName), memberExpressionDeclaration);
      var variableDeclaration = t.variableDeclaration("const", [variableDeclarator]);

      var blockStatement = t.blockStatement([variableDeclaration, expressionStatementAssign, expressionStatementChange]);

      var arrowFunctionExpressionAndInner = t.arrowFunctionExpression([t.identifier("m")], blockStatement);
      var callExpressionImport = t.callExpression(t.import(), [t.stringLiteral('./' + componentName + '/' + componentName)]);
      var memberExpressionAndInner = t.memberExpression(callExpressionImport, t.identifier("then"));
      var callExpressionAndInner = t.callExpression(memberExpressionAndInner, [arrowFunctionExpressionAndInner]);
      var logicalExpressionAndInner = t.logicalExpression("&&", callExpressionAndInner, t.nullLiteral());
      var memberExpression = t.memberExpression(t.thisExpression(), t.identifier(vmLazyProp));
      var logicalExpressionOr = t.logicalExpression("||", memberExpression, logicalExpressionAndInner);
      var callExpressionAnd = getVmCallExpression(false, bindingObject, path, t, 'getValue', t.stringLiteral(bindText));
      var logicalExpressionAndOuter = t.logicalExpression("&&", callExpressionAnd, logicalExpressionOr);
      return logicalExpressionAndOuter;
    },
    getReplacementWithRequire: function getReplacementWithRequire(jSXElement, t, bindingObject, path, bindText) {
      var componentName = jSXElement.openingElement.name.name; // ???
      var vmLazyProp = "vmLazy" + componentName + lazyCounter++;

      var memberExpressionChange3 = t.memberExpression(t.thisExpression(), t.identifier('vmChange'));
      var callExpressionChange1 = t.callExpression(memberExpressionChange3, []);
      var arrowFunctionExpressionChange = t.arrowFunctionExpression([], callExpressionChange1);
      var memberExpressionChange2 = t.memberExpression(t.identifier('ViewModel'), t.identifier('Tracker'));
      var memberExpressionChange = t.memberExpression(memberExpressionChange2, t.identifier('afterFlush'));
      var callExpressionChange = t.callExpression(memberExpressionChange, [arrowFunctionExpressionChange]);
      var expressionStatementChange = t.expressionStatement(callExpressionChange);

      var memberExpressionAssign = t.memberExpression(t.thisExpression(), t.identifier(vmLazyProp));
      var assignmentExpression = t.assignmentExpression("=", memberExpressionAssign, jSXElement);
      var expressionStatementAssign = t.expressionStatement(assignmentExpression);

      var callExpressionDeclaration = t.callExpression(t.identifier('require'), [t.stringLiteral('./' + componentName + '/' + componentName)]);
      var memberExpressionDeclaration = t.memberExpression(callExpressionDeclaration, t.identifier(componentName));
      var variableDeclarator = t.variableDeclarator(t.identifier(componentName), memberExpressionDeclaration);
      var variableDeclaration = t.variableDeclaration("var", [variableDeclarator]);

      var blockStatement = t.blockStatement([variableDeclaration, expressionStatementAssign, expressionStatementChange]);

      var arrowFunctionExpression = t.arrowFunctionExpression([t.identifier('require')], blockStatement);
      var arrayExpression = t.arrayExpression([t.stringLiteral('./' + componentName + '/' + componentName)]);
      var memberExpressionRequire = t.memberExpression(t.identifier('require'), t.identifier('ensure'));
      var callExpressionOr = t.callExpression(memberExpressionRequire, [arrayExpression, arrowFunctionExpression]);
      var memberExpression = t.memberExpression(t.thisExpression(), t.identifier(vmLazyProp));
      var logicalExpressionOr = t.logicalExpression("||", memberExpression, callExpressionOr);
      var callExpressionAnd = getVmCallExpression(false, bindingObject, path, t, 'getValue', t.stringLiteral(bindText));
      var logicalExpressionAnd = t.logicalExpression("&&", callExpressionAnd, logicalExpressionOr);
      return logicalExpressionAnd;
    }
  }
};

exports.bindings = bindings;
exports.getVmCallExpression = getVmCallExpression;