'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getValue = function getValue(bindText, method, t) {
  var memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier(method), false);
  var callExpression = t.callExpression(memberExpression, [t.thisExpression(), t.stringLiteral(bindText)]);
  var jsxExpressionContainer = t.jSXExpressionContainer(callExpression);
  return jsxExpressionContainer;
};

var bindings = {
  text: {
    process: function process(bindText, attributePath, t) {
      var elementPath = attributePath.parentPath.parentPath;
      var jsxExpressionContainer = getValue(bindText, 'getValue', t);
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
      var jSXExpressionContainer = getValue(bindText, 'getValue', t);
      var jSXAttribute = t.jSXAttribute(t.jSXIdentifier('defaultValue'), jSXExpressionContainer);
      var openingElementPath = attributePath.parentPath;
      openingElementPath.node.attributes.push(jSXAttribute);

      var jSXAttributeSet_onChange = t.jSXAttribute(t.jSXIdentifier('onChange'), getValue(bindText, 'setInputValue', t));
      openingElementPath.node.attributes.push(jSXAttributeSet_onChange);
      var jSXAttributeSet_ref = t.jSXAttribute(t.jSXIdentifier('ref'), getValue(bindText, 'getValueRef', t));
      openingElementPath.node.attributes.push(jSXAttributeSet_ref);
    }
  },
  defaultBinding: {
    process: function process(bindText, attributePath, t, bindName) {
      var openingElementPath = attributePath.parentPath;
      var jSXAttributeSet = t.jSXAttribute(t.jSXIdentifier('on' + bindName[0].toUpperCase() + bindName.substr(1)), getValue(bindText, 'setValue', t));
      openingElementPath.node.attributes.push(jSXAttributeSet);
    }
  }
};

exports.default = bindings;