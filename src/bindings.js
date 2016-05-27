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
  },

  'if': {
    process(bindText, attributePath, t) {
      // console.log("-------------------------")
      // console.log( attributePath.parentPath.node.attributes )
      const jSXElement = attributePath.parentPath.parent;

      //console.log("-------------------------")
      // clean(jSXElement);
      // console.log(jSXElement);

      const jSXElement2 = attributePath.parentPath.parentPath.node;
      // console.log("-------------------------")
      // clean(jSXElement2);
      // console.log(jSXElement2);

      //console.log(jSXElement.openingElement.attributes);
      const memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier('getValue'), false);
      const callExpression = t.callExpression(memberExpression, [t.thisExpression(), t.stringLiteral(bindText)])
      const conditionalExpression = t.conditionalExpression(callExpression, jSXElement, t.nullLiteral());
      const jSXExpressionContainer = t.jSXExpressionContainer(conditionalExpression);
      clean(jSXExpressionContainer);

      //console.log(attributePath.parentPath);


      const container = attributePath.parentPath.parentPath.container;
      console.log(attributePath.parentPath.parentPath)
      return;

      if (container.type === "ConditionalExpression") {
        //container.consequent = jSXExpressionContainer;
      } else {
        //console.log(jSXElement.openingElement.attributes);
        //container.length = 0;
        //attributePath.parentPath.parentPath.replaceWith(jSXExpressionContainer);
        for (let i = 0, len = container.length; i < len; i++){
          if (container[i] === jSXElement){
            //console.log(container.path);
            //console.log(jSXExpressionContainer);
            container.splice(i, 1, jSXExpressionContainer);
            break;
          }
        }
        //container.push(jSXElement);
      }
      //console.log(dump(container));
    }
  }

}

export default bindings;