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
  html: {
    process(bindText, attributePath, t) {
      const memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier('getValue'), false);
      const callExpression = t.callExpression(memberExpression, [t.thisExpression(), t.stringLiteral(bindText)])
      const objectProperty = t.objectProperty(
        t.identifier('__html'),
        callExpression
      );
      const objectExpression = t.objectExpression([objectProperty])
      const jsxExpressionContainer = t.jSXExpressionContainer(objectExpression);
      const jsxAttribute = t.jSXAttribute(
        t.jSXIdentifier('dangerouslySetInnerHTML'),
        jsxExpressionContainer
      )
      const elementPath = attributePath.parentPath;
      elementPath.node.attributes.push(jsxAttribute)
    }
  },
  value: {
    process(bindText, attributePath, t){
      const jSXExpressionContainer = getValue(bindText, 'getValue', t);
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('defaultValue'), jSXExpressionContainer)
      const openingElementPath = attributePath.parentPath
      openingElementPath.node.attributes.push(jSXAttribute);

      const jSXAttributeSet_onChange = t.jSXAttribute(t.jSXIdentifier('onChange'), getValue(bindText, 'setInputValue', t))
      openingElementPath.node.attributes.push(jSXAttributeSet_onChange);
      const jSXAttributeSet_ref = t.jSXAttribute(t.jSXIdentifier('ref'), getValue(bindText, 'getValueRef', t))
      openingElementPath.node.attributes.push(jSXAttributeSet_ref);
    }
  },
  defaultBinding: {
    process(bindText, attributePath, t, bindName){
      const openingElementPath = attributePath.parentPath
      const jSXAttributeSet = t.jSXAttribute(t.jSXIdentifier('on' + bindName[0].toUpperCase() + bindName.substr(1)), getValue(bindText, 'setValue', t))
      openingElementPath.node.attributes.push(jSXAttributeSet);
    }
  }
}

export default bindings;