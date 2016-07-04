'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      CallExpression: function CallExpression(path) {
        var helper = new _Helper2.default(path, t);

        // Only do this if we find a view model (not declared already)
        if (path.scope.hasBinding(helper.vmName()) || !helper.isViewModel()) return;

        helper.addImportDeclaration('React', 'react');
        helper.addImportDeclaration('ViewModel', 'viewmodel-react');

        var _helper$initialMethod = helper.initialMethodsAndProperties();

        var _helper$initialMethod2 = _slicedToArray(_helper$initialMethod, 2);

        var initialMethods = _helper$initialMethod2[0];
        var initialProperties = _helper$initialMethod2[1];


        var componentName = path.node.callee.name;
        helper.prepareConstructor(componentName, initialMethods, initialProperties);
        var classMethods = helper.classMethods(initialMethods);

        var identifier = t.identifier(componentName);
        var objectIdentifier = t.identifier('React');
        var propertyIdentifier = t.identifier('Component');
        var memberExpression = t.memberExpression(objectIdentifier, propertyIdentifier, false);
        var classBody = t.classBody(classMethods);
        var classDeclaration = t.classDeclaration(identifier, memberExpression, classBody, []);
        var exportDeclaration = t.exportNamedDeclaration(classDeclaration, []);
        path.parentPath.replaceWith(exportDeclaration);
      },
      JSXAttribute: function JSXAttribute(path) {
        var helper = new _Helper2.default(path, t);
        if (path.node.name.name === "b") {

          var bindingText = path.node.value.value;
          var bindingObject = (0, _parseBind.parseBind)(bindingText);
          var allCompiled = true;
          for (var binding in bindingObject) {
            if (allCompiled && !compiledBindings[binding]) allCompiled = false;
            if (_bindings2.default[binding]) {
              _bindings2.default[binding].process((0, _parseBind.bindToString)(bindingObject[binding]), path, t, binding, bindingObject);
            }
          }
          if (!allCompiled) {
            _bindings2.default.defaultBinding.process(bindingText, path, t);
          }
          path.remove();
        } else if (path.node.name.name === "value") {
          var hasBinding = false;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = path.parent.attributes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var attribute = _step.value;

              if (attribute.name.name === "b") {
                hasBinding = true;
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

          if (hasBinding) {
            path.node.name.name = "defaultValue";
          }
        } else if (path.node.name.name === "class") {
          path.node.name.name = "className";
        } else if (path.node.name.name === "style" && path.node.value.type === 'StringLiteral') {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = path.parent.attributes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var _attribute = _step2.value;

              if (_attribute.name.name === "b") {
                if ((0, _parseBind.parseBind)(_attribute.value.value).style) {
                  return;
                }
                break;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          var newValue = path.node.value.value;
          if (~newValue.indexOf(";")) {
            newValue = newValue.split(";").join(",");
          }
          var bind = (0, _parseBind.parseBind)(newValue);
          var properties = [];
          for (var bindName in bind) {
            if (!bindName) continue;
            var newName = helper.reactStyle(bindName);
            var identifier = t.identifier(newName);
            var withoutQuotes = helper.removeQuotes(bind[bindName]);
            var objectProperty = t.objectProperty(identifier, t.stringLiteral(withoutQuotes));
            properties.push(objectProperty);
          }
          var objectExpression = t.objectExpression(properties);
          var jSXExpressionContainer = t.jSXExpressionContainer(objectExpression);
          path.node.value = jSXExpressionContainer;
        }
      },
      JSXOpeningElement: function JSXOpeningElement(path) {
        var helper = new _Helper2.default(path, t);
        var name = path.node.name.name;
        if (name[0] === name[0].toLowerCase()) return;
        helper.addParentAttribute();
        if (!path.scope.hasBinding(name)) {
          helper.addImportDeclaration(name, './' + name + '/' + name, false);
        }
      }
    }
  };
};

var _Helper = require('./Helper');

var _Helper2 = _interopRequireDefault(_Helper);

var _parseBind = require('./parseBind');

var _bindings = require('./bindings');

var _bindings2 = _interopRequireDefault(_bindings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ran = false;

var bad = {
  start: 1, end: 1, loc: 1
};

var compiledBindings = {
  text: 1,
  html: 1,
  'class': 1,
  'if': 1,
  'style': 1
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

var isString = function isString(str) {
  return typeof str === 'string' || str instanceof String;
};