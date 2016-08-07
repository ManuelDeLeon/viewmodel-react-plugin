const isString = function(str) {
  return typeof str === 'string' || str instanceof String;
}

const getValue = function(bindText, method, t){
  const memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier(method), false);
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

const getDisabled = function(isEnabled) {
   return {
    process(bindText, attributePath, t) {
      const openingElementPath = attributePath.parentPath
  
      let styleIndex = -1;
      let found = false;
      for(let attr of openingElementPath.node.attributes) {
        styleIndex++;
        if (attr.name.name === 'disabled') {
          found = true;
          break;
        }
      }
  
      const jSXExpressionContainer = getVmCall(t, 'getDisabled', t.thisExpression(), t.booleanLiteral(isEnabled), t.stringLiteral(bindText));
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('disabled'), jSXExpressionContainer)
  
      if (found){
        openingElementPath.node.attributes.splice(styleIndex, 1);
      }
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  };
}

var bad = {
  start: 1, end: 1, loc: 1
}
function dump(arr,level) {
  var dumped_text = "";
  if(!level) level = 0;

  var level_padding = "";
  for(var j=0;j<level+1;j++) level_padding += "  ";

  if(typeof(arr) == 'object') {
    for(var item in arr) {
      if (bad[item]) continue;
      var value = arr[item];

      if(typeof(value) == 'object') {
        dumped_text += level_padding + "'" + item + "' ...\n";
        dumped_text += dump(value,level+1);
      } else {
        if (item[0] !== '_') {
          dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
        }
      }
    }
  } else {
    dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
  }
  return dumped_text;
};

function clean(obj) {

    for(var item in obj) {
      if (bad[item]) delete obj[item];

      var value = obj[item];

      if(typeof(value) == 'object') {
        clean(value);
      }
    }
};

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
    process(bindText, attributePath, t, binding, bindingObject){
      const jSXExpressionContainer = getVmCall(t, 'getValue', t.thisExpression(), t.stringLiteral(bindText));
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('defaultValue'), jSXExpressionContainer)
      const openingElementPath = attributePath.parentPath
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  },

  check: {
    process(bindText, attributePath, t, binding, bindingObject){
      const jSXExpressionContainer = getVmCall(t, 'getValue', t.thisExpression(), t.stringLiteral(bindText));
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('defaultChecked'), jSXExpressionContainer)
      const openingElementPath = attributePath.parentPath
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  },

  defaultBinding: {
    process(bindingText, attributePath, t){
      const jSXExpressionContainer_ref = getVmCall(t, 'bindElement', t.thisExpression(), t.stringLiteral(bindingText));
      const jSXAttributeSet_ref = t.jSXAttribute(t.jSXIdentifier('ref'), jSXExpressionContainer_ref);
      const openingElementPath = attributePath.parentPath;
      openingElementPath.node.attributes.push(jSXAttributeSet_ref);
    }
  },

  'class': {
    process(bindText, attributePath, t) {
      const openingElementPath = attributePath.parentPath

      let currentClasses = "";
      let found = false;
      let classIndex = -1;
      for(let attr of openingElementPath.node.attributes) {
        classIndex++;
        if (attr.name.name === 'className' || attr.name.name === 'class') {
          found = true;
          currentClasses = attr.value.value;
          break;
        }
      }

      const jSXExpressionContainer = getVmCall(t, 'getClass', t.thisExpression(), t.stringLiteral(currentClasses), t.stringLiteral(bindText));
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('className'), jSXExpressionContainer)
      if (found) {
        openingElementPath.node.attributes.splice(classIndex, 1);
      }
      openingElementPath.node.attributes.push(jSXAttribute);

    }
  },

  'if': {
    process(bindText, attributePath, t) {
      const jSXElement = attributePath.parentPath.parent;
      const memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier('getValue'), false);
      const callExpression = t.callExpression(memberExpression, [t.thisExpression(), t.stringLiteral(bindText)])
      const conditionalExpression = t.conditionalExpression(callExpression, jSXElement, t.nullLiteral());
      const jSXExpressionContainer = t.jSXExpressionContainer(conditionalExpression);

      if (attributePath.parentPath.parentPath.parentPath.node.type === 'ReturnStatement') {
        attributePath.parentPath.parentPath.replaceWith(conditionalExpression);
      } else {
        attributePath.parentPath.parentPath.replaceWith(jSXExpressionContainer);
      }
    }
  },

  'unless': {
    process(bindText, attributePath, t) {
      const jSXElement = attributePath.parentPath.parent;
      const memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier('getValue'), false);
      const callExpression = t.callExpression(memberExpression, [t.thisExpression(), t.stringLiteral(bindText)])
      const unaryExpression = t.unaryExpression("!", callExpression);
      const conditionalExpression = t.conditionalExpression(unaryExpression, jSXElement, t.nullLiteral());
      const jSXExpressionContainer = t.jSXExpressionContainer(conditionalExpression);

      attributePath.parentPath.parentPath.replaceWith(jSXExpressionContainer);
      
    }
  },

  'style': {
    process(bindText, attributePath, t) {
      const openingElementPath = attributePath.parentPath

      let currentStyle = "";
      let styleIndex = -1;
      let found = false;
      for(let attr of openingElementPath.node.attributes) {
        styleIndex++;
        if (attr.name.name === 'style') {
          found = true;
          currentStyle = attr.value.value;
          break;
        }
      }

      const jSXExpressionContainer = getVmCall(t, 'getStyle', t.thisExpression(), t.stringLiteral(currentStyle), t.stringLiteral(bindText));
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('style'), jSXExpressionContainer)

      if (found){
        openingElementPath.node.attributes.splice(styleIndex, 1);
      }
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  },

  'enable': getDisabled(true),
  'disable': getDisabled(false),

  'repeat': {
    process(bindText, attributePath, t, binding, bindingObject) {
      const jSXElement = attributePath.parentPath.parent;
      const memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier('getValue'), false);
      const callExpressionGetValue = t.callExpression(memberExpression, [t.thisExpression(), t.stringLiteral(bindText)]);

      const memberExpressionMap = t.memberExpression(callExpressionGetValue, t.identifier("map"), false);

      const returnStatement = t.returnStatement(jSXElement);
      const blockStatement = t.blockStatement([returnStatement]);

      const arrowFunctionExpression = t.arrowFunctionExpression([t.identifier("repeatObject"), t.identifier("repeatKey")], blockStatement);
      const callExpressionMap = t.callExpression(memberExpressionMap, [arrowFunctionExpression]);
      const jSXExpressionContainer = t.jSXExpressionContainer(callExpressionMap);

      const jSXSpreadAttribute = t.jSXSpreadAttribute(t.identifier('repeatObject'));
      jSXElement.openingElement.attributes.push(jSXSpreadAttribute);

      let jSXExpressionContainerKey;
      if (bindingObject.key) {
        const memberExpressionKey = t.memberExpression(t.identifier("repeatObject"), t.identifier(bindingObject.key))
        jSXExpressionContainerKey = t.jSXExpressionContainer(memberExpressionKey);
      } else {
        jSXExpressionContainerKey = t.jSXExpressionContainer(t.identifier("repeatKey"));
      }


      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('key'), jSXExpressionContainerKey);
      jSXElement.openingElement.attributes.push(jSXAttribute);

      attributePath.parentPath.parentPath.replaceWith(jSXExpressionContainer);
    }
  }
}

export default bindings;