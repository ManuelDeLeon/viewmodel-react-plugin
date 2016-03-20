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
  value: {
    process: function process(bindText, attributePath, t) {
      var jSXExpressionContainer = getValue(bindText, 'getValue', t);
      var jSXAttribute = t.jSXAttribute(t.jSXIdentifier('value'), jSXExpressionContainer);
      var openingElementPath = attributePath.parentPath;
      openingElementPath.node.attributes.push(jSXAttribute);

      var jSXAttributeSet = t.jSXAttribute(t.jSXIdentifier('onChange'), getValue(bindText, 'setInputValue', t));
      openingElementPath.node.attributes.push(jSXAttributeSet);
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