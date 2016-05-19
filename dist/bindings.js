'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var isString = function isString(str) {
  return typeof str === 'string' || str instanceof String;
};

var getValue = function getValue(bindText, method, t) {
  var memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier(method), false);
  if (!isString(bindText)) {
    bindText = JSON.stringify(bindText);
  }
  var callExpression = t.callExpression(memberExpression, [t.thisExpression(), t.stringLiteral(bindText)]);
  var jsxExpressionContainer = t.jSXExpressionContainer(callExpression);
  return jsxExpressionContainer;
};

var getVmCall = function getVmCall(t, method) {
  var memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier(method), false);

  for (var _len = arguments.length, params = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    params[_key - 2] = arguments[_key];
  }

  var callExpression = t.callExpression(memberExpression, params);
  var jsxExpressionContainer = t.jSXExpressionContainer(callExpression);
  return jsxExpressionContainer;
};

var bindings = {
  text: {
    process: function process(bindText, attributePath, t) {
      var elementPath = attributePath.parentPath.parentPath;
      var jsxExpressionContainer = getVmCall(t, 'getValue', t.thisExpression(), t.stringLiteral(bindText));
      elementPath.node.children.push(jsxExpressionContainer);
    }
  },
  html: {
    process: function process(bindText, attributePath, t) {
      var memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier('getValue'), false);
      var callExpression = t.callExpression(memberExpression, [t.thisExpression(), t.stringLiteral(bindText)]);
      var objectProperty = t.objectProperty(t.identifier('__html'), callExpression);
      var objectExpression = t.objectExpression([objectProperty]);
      var jsxExpressionContainer = t.jSXExpressionContainer(objectExpression);
      var jsxAttribute = t.jSXAttribute(t.jSXIdentifier('dangerouslySetInnerHTML'), jsxExpressionContainer);
      var elementPath = attributePath.parentPath;
      elementPath.node.attributes.push(jsxAttribute);
    }
  },
  value: {
    process: function process(bindText, attributePath, t) {
      var jSXExpressionContainer = getVmCall(t, 'getValue', t.thisExpression(), t.stringLiteral(bindText));
      var jSXAttribute = t.jSXAttribute(t.jSXIdentifier('defaultValue'), jSXExpressionContainer);
      var openingElementPath = attributePath.parentPath;
      openingElementPath.node.attributes.push(jSXAttribute);

      var jSXExpressionContainer_set = getVmCall(t, 'setInputValue', t.thisExpression(), t.stringLiteral(bindText));
      var jSXAttributeSet_onChange = t.jSXAttribute(t.jSXIdentifier('onChange'), jSXExpressionContainer_set);
      openingElementPath.node.attributes.push(jSXAttributeSet_onChange);
      var jSXExpressionContainer_ref = getVmCall(t, 'getValueRef', t.thisExpression(), t.stringLiteral(bindText));
      var jSXAttributeSet_ref = t.jSXAttribute(t.jSXIdentifier('ref'), jSXExpressionContainer_ref);
      openingElementPath.node.attributes.push(jSXAttributeSet_ref);
    }
  },
  check: {
    process: function process(bindText, attributePath, t, binding, bindingObject) {
      if (bindingObject.group) {
        return;
      }

      var openingElementPath = attributePath.parentPath;
      var jSXExpressionContainer_ref = getVmCall(t, 'getCheckHook', t.thisExpression(), t.stringLiteral(bindText));
      var jSXAttributeSet_ref = t.jSXAttribute(t.jSXIdentifier('ref'), jSXExpressionContainer_ref);
      openingElementPath.node.attributes.push(jSXAttributeSet_ref);
    }
  },
  group: {
    process: function process(bindText, attributePath, t, binding, bindingObject) {
      var openingElementPath = attributePath.parentPath;
      var checkBindText = "";
      if (bindingObject.check) {
        checkBindText = isString(bindingObject.check) ? bindingObject.check : JSON.stringify(bindingObject.check);
      }
      var jSXExpressionContainer_ref = getVmCall(t, 'getGroupHook', t.thisExpression(), t.stringLiteral(bindText), t.booleanLiteral(!!bindingObject.check), t.stringLiteral(checkBindText));
      var jSXAttributeSet_ref = t.jSXAttribute(t.jSXIdentifier('ref'), jSXExpressionContainer_ref);
      openingElementPath.node.attributes.push(jSXAttributeSet_ref);

      return;

      // const jSXExpressionContainer = getVmCall(t, 'getValue', t.thisExpression(), t.stringLiteral(bindText));
      // const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('defaultChecked'), jSXExpressionContainer)
      // const openingElementPath = attributePath.parentPath
      // openingElementPath.node.attributes.push(jSXAttribute);
      //
      //
      // if (bindingObject.check) {
      //   const memberExpression_check = t.memberExpression(t.identifier('ViewModel'), t.identifier('setInputCheck'), false);
      //   const callExpression_check = t.callExpression(memberExpression_check, [t.thisExpression(), t.stringLiteral(bindingObject.check)]);
      //   const expressionStatement_check = t.expressionStatement(callExpression_check);
      //
      //   const memberExpression_group = t.memberExpression(t.identifier('ViewModel'), t.identifier('setInputGroup'), false);
      //   const callExpression_group = t.callExpression(memberExpression_group, [t.thisExpression(), t.stringLiteral(bindingObject.group)]);
      //   const expressionStatement_group = t.expressionStatement(callExpression_group);
      //
      //
      //   const blockStatement = t.blockStatement([expressionStatement_check, expressionStatement_group]);
      //   const arrowFunctionExpression = t.arrowFunctionExpression([t.identifier('e')], blockStatement);
      //   const jsxExpressionContainer_group = t.jSXExpressionContainer(arrowFunctionExpression);
      //   const jsxAttribute_group = t.jSXAttribute(t.jSXIdentifier('onClick'), jsxExpressionContainer_group);
      //   openingElementPath.node.attributes.push(jsxAttribute_group);
      // } else {
      //   const jSXExpressionContainer_set = getVmCall(t, 'setInputGroup', t.thisExpression(), t.stringLiteral(bindText));
      //   const jSXAttributeSet_onChange = t.jSXAttribute(t.jSXIdentifier('onClick'), jSXExpressionContainer_set)
      //   openingElementPath.node.attributes.push(jSXAttributeSet_onChange);
      // }
      //
      // const jSXExpressionContainer_ref = getVmCall(t, 'getGroupRef', t.thisExpression(), t.stringLiteral(bindText));
      // const jSXAttributeSet_ref = t.jSXAttribute(t.jSXIdentifier('ref'), jSXExpressionContainer_ref)
      // openingElementPath.node.attributes.push(jSXAttributeSet_ref);
    }
  },
  defaultBinding: {
    process: function process(bindText, attributePath, t, bindName) {
      var openingElementPath = attributePath.parentPath;
      var text = isString(bindText) ? bindText : JSON.stringify(bindText);
      var jsxExpressionContainer = getVmCall(t, 'setValue', t.thisExpression(), t.stringLiteral(text));
      var jSXAttributeSet = t.jSXAttribute(t.jSXIdentifier('on' + bindName[0].toUpperCase() + bindName.substr(1)), jsxExpressionContainer);
      openingElementPath.node.attributes.push(jSXAttributeSet);
    }
  },

  'class': {
    process: function process(bindText, attributePath, t) {
      var openingElementPath = attributePath.parentPath;

      var currentClasses = "";
      var classIndex = -1;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = openingElementPath.node.attributes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var attr = _step.value;

          classIndex++;
          if (attr.name.name === 'className' || attr.name.name === 'class') {
            currentClasses = attr.value.value;
            break;
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

      var text = isString(bindText) ? bindText : JSON.stringify(bindText);
      var jSXExpressionContainer = getVmCall(t, 'getClass', t.thisExpression(), t.stringLiteral(currentClasses), t.stringLiteral(text));
      var jSXAttribute = t.jSXAttribute(t.jSXIdentifier('className'), jSXExpressionContainer);
      if (classIndex >= 0) {
        openingElementPath.node.attributes.splice(classIndex, 1);
      }
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  }

};

exports.default = bindings;