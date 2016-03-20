const getValue = function(bindText, method, t){
  const memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier(method), false);
  const callExpression = t.callExpression(memberExpression, [t.thisExpression(), t.stringLiteral(bindText)])
  const jsxExpressionContainer = t.jSXExpressionContainer(callExpression);
  return jsxExpressionContainer;
}

const bindings = {
  text: {
    process(bindText, attributePath, t) {
      const elementPath = attributePath.parentPath.parentPath;
      const jsxExpressionContainer = getValue(bindText, 'getValue', t);
      elementPath.node.children.push(jsxExpressionContainer)
    }
  },
  value: {
    process(bindText, attributePath, t){
      const jSXExpressionContainer = getValue(bindText, 'getValue', t);
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('value'), jSXExpressionContainer)
      const openingElementPath = attributePath.parentPath
      openingElementPath.node.attributes.push(jSXAttribute);

      const jSXAttributeSet = t.jSXAttribute(t.jSXIdentifier('onChange'), getValue(bindText, 'setInputValue', t))
      openingElementPath.node.attributes.push(jSXAttributeSet);
    }
  }
}

export default bindings;