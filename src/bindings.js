const isString = function(str) {
  return typeof str === 'string' || str instanceof String;
}

const getValue = function(bindText, method, t){
  const memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier(method), false);
  if (!isString(bindText)) {
    bindText = JSON.stringify(bindText);
  }
  const callExpression = t.callExpression(memberExpression, [t.thisExpression(), t.stringLiteral(bindText)])
  const jsxExpressionContainer = t.jSXExpressionContainer(callExpression);
  return jsxExpressionContainer;
}

const getVmCall = function(t, method, ...params){
  const memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier(method), false);
  const callExpression = t.callExpression(memberExpression, params);
  const jsxExpressionContainer = t.jSXExpressionContainer(callExpression);
  return jsxExpressionContainer;
}


const bindings = {
  text: {
    process(bindText, attributePath, t) {
      const elementPath = attributePath.parentPath.parentPath;
      const jsxExpressionContainer = getVmCall(t, 'getValue', t.thisExpression(), t.stringLiteral(bindText));
      elementPath.node.children.push(jsxExpressionContainer);
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
      const jSXExpressionContainer = getVmCall(t, 'getValue', t.thisExpression(), t.stringLiteral(bindText));
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('defaultValue'), jSXExpressionContainer)
      const openingElementPath = attributePath.parentPath
      openingElementPath.node.attributes.push(jSXAttribute);

      const jSXExpressionContainer_set = getVmCall(t, 'setInputValue', t.thisExpression(), t.stringLiteral(bindText));
      const jSXAttributeSet_onChange = t.jSXAttribute(t.jSXIdentifier('onChange'), jSXExpressionContainer_set)
      openingElementPath.node.attributes.push(jSXAttributeSet_onChange);
      const jSXExpressionContainer_ref = getVmCall(t, 'getValueRef', t.thisExpression(), t.stringLiteral(bindText));
      const jSXAttributeSet_ref = t.jSXAttribute(t.jSXIdentifier('ref'), jSXExpressionContainer_ref)
      openingElementPath.node.attributes.push(jSXAttributeSet_ref);
    }
  },
  check: {
    process(bindText, attributePath, t, binding, bindingObject){
      if (bindingObject.group) {
        return;
      }
      const jSXExpressionContainer = getVmCall(t, 'getValue', t.thisExpression(), t.stringLiteral(bindText));
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('defaultChecked'), jSXExpressionContainer)
      const openingElementPath = attributePath.parentPath
      openingElementPath.node.attributes.push(jSXAttribute);

      const jSXExpressionContainer_set = getVmCall(t, 'setInputCheck', t.thisExpression(), t.stringLiteral(bindText));
      const jSXAttributeSet_onChange = t.jSXAttribute(t.jSXIdentifier('onClick'), jSXExpressionContainer_set)
      openingElementPath.node.attributes.push(jSXAttributeSet_onChange);
      const jSXExpressionContainer_ref = getVmCall(t, 'getCheckRef', t.thisExpression(), t.stringLiteral(bindText));
      const jSXAttributeSet_ref = t.jSXAttribute(t.jSXIdentifier('ref'), jSXExpressionContainer_ref)
      openingElementPath.node.attributes.push(jSXAttributeSet_ref);
    }
  },
  group: {
    process(bindText, attributePath, t){
      const jSXExpressionContainer = getVmCall(t, 'getValue', t.thisExpression(), t.stringLiteral(bindText));
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('defaultChecked'), jSXExpressionContainer)
      const openingElementPath = attributePath.parentPath
      openingElementPath.node.attributes.push(jSXAttribute);

      const jSXExpressionContainer_set = getVmCall(t, 'setInputGroup', t.thisExpression(), t.stringLiteral(bindText));
      const jSXAttributeSet_onChange = t.jSXAttribute(t.jSXIdentifier('onClick'), jSXExpressionContainer_set)
      openingElementPath.node.attributes.push(jSXAttributeSet_onChange);
      const jSXExpressionContainer_ref = getVmCall(t, 'getGroupRef', t.thisExpression(), t.stringLiteral(bindText));
      const jSXAttributeSet_ref = t.jSXAttribute(t.jSXIdentifier('ref'), jSXExpressionContainer_ref)
      openingElementPath.node.attributes.push(jSXAttributeSet_ref);
    }
  },
  defaultBinding: {
    process(bindText, attributePath, t, bindName){
      const openingElementPath = attributePath.parentPath;
      const text = isString(bindText) ? bindText : JSON.stringify(bindText);
      const jsxExpressionContainer = getVmCall(t, 'setValue', t.thisExpression(), t.stringLiteral(text));
      const jSXAttributeSet = t.jSXAttribute(t.jSXIdentifier('on' + bindName[0].toUpperCase() + bindName.substr(1)), jsxExpressionContainer);
      openingElementPath.node.attributes.push(jSXAttributeSet);
    }
  },

  'class': {
    process(bindText, attributePath, t) {
      const openingElementPath = attributePath.parentPath

      let currentClasses = "";
      let classIndex = -1;
      for(let attr of openingElementPath.node.attributes) {
        classIndex++;
        if (attr.name.name === 'className' || attr.name.name === 'class') {
          currentClasses = attr.value.value;
          break;
        }
      }

      const text = isString(bindText) ? bindText : JSON.stringify(bindText);
      const jSXExpressionContainer = getVmCall(t, 'getClass', t.thisExpression(), t.stringLiteral(currentClasses), t.stringLiteral(text));
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('className'), jSXExpressionContainer)
      if (classIndex >= 0){
        openingElementPath.node.attributes.splice(classIndex, 1);
      }
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  }

}

export default bindings;