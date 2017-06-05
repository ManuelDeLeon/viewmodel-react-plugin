let lazyCounter = 1;

const isString = function(str) {
  return typeof str === 'string' || str instanceof String;
}
const reactStyle = function(str) {
  if(!~str.indexOf('-')) return str;
  let retVal = "";
  for(let block of str.split('-')) {
    if (!block) continue;
    if (!retVal && (block.toLowerCase() === "ms" || str.substr(0, 1) !== "-")) {
      retVal += block.toLowerCase();
    } else {
      retVal += block[0].toUpperCase() + block.substr(1).toLowerCase();
    }
  }
  return retVal;
}

const getVmCallExpression = function(isLoop, bindingObject, path, t, method, ...params){
  const memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier(method), false);
  const repeatObject = !isLoop && (bindingObject.repeat || path.scope.hasBinding('repeatObject')) ? t.identifier('repeatObject') : t.nullLiteral();
  const repeatIndex = !isLoop && (bindingObject.repeat || path.scope.hasBinding('repeatIndex')) ? t.identifier('repeatIndex') : t.nullLiteral();
  params.unshift(t.thisExpression(), repeatObject, repeatIndex);
  const callExpression = t.callExpression(memberExpression, params);
  return callExpression;
}

const getVmCall = function(isLoop, bindingObject, path, t, method, ...params){
  const callExpression = getVmCallExpression(isLoop, bindingObject, path, t, method, ...params);
  const jsxExpressionContainer = t.jSXExpressionContainer(callExpression);
  return jsxExpressionContainer;
}

const getDisabled = function(isEnabled) {
   return {
    process(bindText, attributePath, t, binding, bindingObject) {
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
  
      const jSXExpressionContainer = getVmCall(false, bindingObject, attributePath,t, 'getDisabled', t.booleanLiteral(isEnabled), t.stringLiteral(bindText));
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
    process(bindText, attributePath, t, binding, bindingObject) {
      const elementPath = attributePath.parentPath.parentPath;
      const jsxExpressionContainer = getVmCall(false, bindingObject, attributePath,t, 'getValue', t.stringLiteral(bindText));
      if (elementPath.node.type === 'JSXExpressionContainer') {
        elementPath.node.expression.arguments[0].body.body[0].argument.children.push(jsxExpressionContainer);
      } else {
        elementPath.node.children.push(jsxExpressionContainer);
      }
    }
  },
  html: {
    process(bindText, attributePath, t, binding, bindingObject) {
      const callExpression = getVmCallExpression(false, bindingObject, attributePath, t, 'getValue', t.stringLiteral(bindText));
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
      const jSXExpressionContainer = getVmCall(false, bindingObject, attributePath,t, 'getValue', t.stringLiteral(bindText));
      let defaultValue = 'defaultValue';
      for(let attribute of attributePath.parent.attributes) {
        if (attribute.name.name === "type" && (attribute.value.value === "checkbox" || attribute.value.value === "radio")) {
          defaultValue = 'defaultChecked';
          break;
        }
      }
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier(defaultValue), jSXExpressionContainer)
      const openingElementPath = attributePath.parentPath
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  },

  singleAttribute: {
    process(bindText, attributePath, t, binding, bindingObject){
      const jSXExpressionContainer = getVmCall(false, bindingObject, attributePath,t, 'getValue', t.stringLiteral(bindText));
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier(binding), jSXExpressionContainer)
      const openingElementPath = attributePath.parentPath
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  },

  check: {
    process(bindText, attributePath, t, binding, bindingObject){
      const jSXExpressionContainer = getVmCall(false, bindingObject, attributePath,t, 'getValue', t.stringLiteral(bindText));
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('defaultChecked'), jSXExpressionContainer)
      const openingElementPath = attributePath.parentPath
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  },

  defaultBinding: {
    process(bindingText, attributePath, t, binding, bindingObject){
      const jSXExpressionContainer_ref = getVmCall(false, bindingObject, attributePath,t, 'bindElement', t.stringLiteral(bindingText));
      const jSXAttributeSet_ref = t.jSXAttribute(t.jSXIdentifier('ref'), jSXExpressionContainer_ref);
      const openingElementPath = attributePath.parentPath;
      openingElementPath.node.attributes.push(jSXAttributeSet_ref);
    }
  },

  'class': {
    process(bindText, attributePath, t, binding, bindingObject) {
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

      const jSXExpressionContainer = getVmCall(false, bindingObject, attributePath,t, 'getClass', t.stringLiteral(currentClasses), t.stringLiteral(bindText));
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('className'), jSXExpressionContainer)
      if (found) {
        openingElementPath.node.attributes.splice(classIndex, 1);
      }
      openingElementPath.node.attributes.push(jSXAttribute);

    }
  },

  'unless': {
    process(bindText, attributePath, t, binding, bindingObject) {
      const jSXElement = attributePath.parentPath.parent;
      const callExpression = getVmCallExpression(false, bindingObject, attributePath,t, 'getValue', t.stringLiteral(bindText));
      const unaryExpression = t.unaryExpression("!", callExpression);
      const conditionalExpression = t.conditionalExpression(unaryExpression, jSXElement, t.nullLiteral());
      const jSXExpressionContainer = t.jSXExpressionContainer(conditionalExpression);

      attributePath.parentPath.parentPath.replaceWith(jSXExpressionContainer);
      
    }
  },

  'style': {
    process(bindText, attributePath, t, binding, bindingObject) {
      const elementPath = attributePath.parentPath
      let node = elementPath.node;

      let currentStyle = "";
      let styleIndex = -1;
      let found = false;
      for(let attr of node.attributes) {
        styleIndex++;
        if (attr.type === 'JSXAttribute' && attr.name.name === 'style') {
          found = true;
          for(let inStyle of attr.value.value.split(';')) {
            const colPos = inStyle.indexOf(':');
            const name = inStyle.substring(0, colPos).trim();
            const value = inStyle.substr(colPos + 1).trim();
            currentStyle += reactStyle(name) + ":" + value + ";";
          }
          break;
        }
      }

      const jSXExpressionContainer = getVmCall(false, bindingObject, attributePath,t, 'getStyle', t.stringLiteral(currentStyle), t.stringLiteral(bindText));
      const jSXAttribute = t.jSXAttribute(t.jSXIdentifier('style'), jSXExpressionContainer)

      if (found){
        node.attributes.splice(styleIndex, 1);
      }
      node.attributes.push(jSXAttribute);
    }
  },

  'enable': getDisabled(true),
  'disable': getDisabled(false),
  defer: {
    getReplacement(jSXElement, t, bindingObject, path, bindText) {
      const componentName = jSXElement.openingElement.name.name; // ???
      const vmLazyProp = "vmLazy" + componentName + lazyCounter++;

      const memberExpressionChange3 = t.memberExpression(t.thisExpression(), t.identifier('vmChange'));
      const callExpressionChange1 = t.callExpression(memberExpressionChange3, []);
      const arrowFunctionExpressionChange = t.arrowFunctionExpression([], callExpressionChange1);
      const memberExpressionChange2 = t.memberExpression(t.identifier('ViewModel'), t.identifier('Tracker'));
      const memberExpressionChange = t.memberExpression(memberExpressionChange2, t.identifier('afterFlush'));
      const callExpressionChange = t.callExpression(memberExpressionChange, [arrowFunctionExpressionChange]);
      const expressionStatementChange = t.expressionStatement(callExpressionChange);

      const memberExpressionAssign = t.memberExpression(t.thisExpression(), t.identifier(vmLazyProp));
      const assignmentExpression = t.assignmentExpression("=", memberExpressionAssign, jSXElement);
      const expressionStatementAssign = t.expressionStatement(assignmentExpression);

      const memberExpressionDeclaration = t.memberExpression(t.identifier("m"), t.identifier(componentName));
      const variableDeclarator = t.variableDeclarator(t.identifier(componentName), memberExpressionDeclaration);
      const variableDeclaration = t.variableDeclaration("const", [variableDeclarator]);
      
      const blockStatement = t.blockStatement([variableDeclaration, expressionStatementAssign, expressionStatementChange]);
      
      const arrowFunctionExpressionAndInner = t.arrowFunctionExpression([t.identifier("m")], blockStatement);
      const callExpressionImport = t.callExpression(t.import(), [t.stringLiteral(`./${componentName}/${componentName}`)]);
      const memberExpressionAndInner = t.memberExpression(callExpressionImport, t.identifier("then"));
      const callExpressionAndInner = t.callExpression(memberExpressionAndInner, [arrowFunctionExpressionAndInner]);
      const logicalExpressionAndInner = t.logicalExpression("&&", callExpressionAndInner, t.nullLiteral());
      const memberExpression = t.memberExpression(t.thisExpression(), t.identifier(vmLazyProp));
      const logicalExpressionOr = t.logicalExpression("||", memberExpression, logicalExpressionAndInner);
      const callExpressionAnd = getVmCallExpression(false, bindingObject, path, t, 'getValue', t.stringLiteral(bindText));
      const logicalExpressionAndOuter = t.logicalExpression("&&", callExpressionAnd, logicalExpressionOr);
      return logicalExpressionAndOuter;
    },
    getReplacementWithRequire(jSXElement, t, bindingObject, path, bindText) {
      const componentName = jSXElement.openingElement.name.name; // ???
      const vmLazyProp = "vmLazy" + componentName + lazyCounter++;

      const memberExpressionChange3 = t.memberExpression(t.thisExpression(), t.identifier('vmChange'));
      const callExpressionChange1 = t.callExpression(memberExpressionChange3, []);
      const arrowFunctionExpressionChange = t.arrowFunctionExpression([], callExpressionChange1);
      const memberExpressionChange2 = t.memberExpression(t.identifier('ViewModel'), t.identifier('Tracker'));
      const memberExpressionChange = t.memberExpression(memberExpressionChange2, t.identifier('afterFlush'));
      const callExpressionChange = t.callExpression(memberExpressionChange, [arrowFunctionExpressionChange]);
      const expressionStatementChange = t.expressionStatement(callExpressionChange);

      const memberExpressionAssign = t.memberExpression(t.thisExpression(), t.identifier(vmLazyProp));
      const assignmentExpression = t.assignmentExpression("=", memberExpressionAssign, jSXElement);
      const expressionStatementAssign = t.expressionStatement(assignmentExpression);

      const callExpressionDeclaration = t.callExpression(t.identifier('require'), [t.stringLiteral(`./${componentName}/${componentName}`)])
      const memberExpressionDeclaration = t.memberExpression(callExpressionDeclaration, t.identifier(componentName));
      const variableDeclarator = t.variableDeclarator(t.identifier(componentName), memberExpressionDeclaration);
      const variableDeclaration = t.variableDeclaration("var", [variableDeclarator]);

      const blockStatement = t.blockStatement([variableDeclaration, expressionStatementAssign, expressionStatementChange]);

      const arrowFunctionExpression = t.arrowFunctionExpression([t.identifier('require')], blockStatement);
      const arrayExpression = t.arrayExpression([t.stringLiteral(`./${componentName}/${componentName}`)]);
      const memberExpressionRequire = t.memberExpression(t.identifier('require'), t.identifier('ensure'));
      const callExpressionOr = t.callExpression(memberExpressionRequire, [arrayExpression, arrowFunctionExpression]);
      const memberExpression = t.memberExpression(t.thisExpression(), t.identifier(vmLazyProp))
      const logicalExpressionOr = t.logicalExpression("||", memberExpression, callExpressionOr)
      const callExpressionAnd = getVmCallExpression(false, bindingObject, path, t, 'getValue', t.stringLiteral(bindText));
      const logicalExpressionAnd = t.logicalExpression("&&", callExpressionAnd, logicalExpressionOr);
      return logicalExpressionAnd;
    }
  }
}

export { bindings, getVmCallExpression };