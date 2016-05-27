'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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
    process: function process(bindText, attributePath, t, binding, bindingObject) {
      var jSXExpressionContainer = getVmCall(t, 'getValue', t.thisExpression(), t.stringLiteral(bindText));
      var jSXAttribute = t.jSXAttribute(t.jSXIdentifier('defaultValue'), jSXExpressionContainer);
      var openingElementPath = attributePath.parentPath;
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  },

  check: {
    process: function process(bindText, attributePath, t, binding, bindingObject) {
      var jSXExpressionContainer = getVmCall(t, 'getValue', t.thisExpression(), t.stringLiteral(bindText));
      var jSXAttribute = t.jSXAttribute(t.jSXIdentifier('defaultChecked'), jSXExpressionContainer);
      var openingElementPath = attributePath.parentPath;
      openingElementPath.node.attributes.push(jSXAttribute);
    }
  },

  defaultBinding: {
    process: function process(bindingText, attributePath, t) {
      var jSXExpressionContainer_ref = getVmCall(t, 'bindElement', t.thisExpression(), t.stringLiteral(bindingText));
      var jSXAttributeSet_ref = t.jSXAttribute(t.jSXIdentifier('ref'), jSXExpressionContainer_ref);
      var openingElementPath = attributePath.parentPath;
      openingElementPath.node.attributes.push(jSXAttributeSet_ref);
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
  },

  'if': {
    process: function process(bindText, attributePath, t) {
      // console.log("-------------------------")
      // console.log( attributePath.parentPath.node.attributes )
      var jSXElement = attributePath.parentPath.parent;

      console.log("-------------------------");
      clean(jSXElement);
      console.log(jSXElement);

      var jSXElement2 = attributePath.parentPath.parentPath.node;
      console.log("-------------------------");
      clean(jSXElement2);
      console.log(jSXElement2);

      //console.log(jSXElement.openingElement.attributes);
      var memberExpression = t.memberExpression(t.identifier('ViewModel'), t.identifier('getValue'), false);
      var callExpression = t.callExpression(memberExpression, [t.thisExpression(), t.stringLiteral(bindText)]);
      var conditionalExpression = t.conditionalExpression(callExpression, jSXElement2, t.nullLiteral());
      var jSXExpressionContainer = t.jSXExpressionContainer(conditionalExpression);
      clean(jSXExpressionContainer);

      //console.log(attributePath.parentPath);

      var container = attributePath.parentPath.parentPath.container;

      if (container.type === "ConditionalExpression") {
        //container.consequent = jSXExpressionContainer;
      } else {
          //console.log(jSXElement.openingElement.attributes);
          //container.length = 0;
          //attributePath.parentPath.parentPath.replaceWith(jSXExpressionContainer);
          for (var i = 0, len = container.length; i < len; i++) {
            if (container[i] === jSXElement) {
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

};

exports.default = bindings;