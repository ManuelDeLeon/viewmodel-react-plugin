'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      CallExpression: function CallExpression(path) {
        var helper = new _Helper2.default(path, t);
        if (!path.node.arguments[0].properties) return;
        //console.log(path.node.arguments[0].properties[0].body.body[0].expression.openingElement.attributes[0])
        console.log(path.node.arguments[0].properties[0].body.body[0].expression.openingElement);
        // Only do this if we find a view model (not declared already)
        if (path.scope.hasBinding(helper.vmName()) || !helper.isViewModel()) return;

        helper.addImportDeclaration('React', 'react');
        helper.addImportDeclaration('ViewModel', 'viewmodel-react');

        var _helper$classMethodsA = helper.classMethodsAndProperties();

        var _helper$classMethodsA2 = _slicedToArray(_helper$classMethodsA, 2);

        var classMethods = _helper$classMethodsA2[0];
        var classProperties = _helper$classMethodsA2[1];

        // helper.prepareConstructor(classMethods, classProperties);
        // helper.prepareComponentDidMount(classMethods, classProperties);
        // helper.prepareComponentWillMount(classMethods);
        // helper.prepareComponentWillUnmount(classMethods);
        // helper.addLoadToClass(classMethods);

        var componentName = path.node.callee.name;
        var identifier = t.identifier(componentName);
        var objectIdentifier = t.identifier('React');
        var propertyIdentifier = t.identifier('Component');
        var memberExpression = t.memberExpression(objectIdentifier, propertyIdentifier, false);
        var classBody = t.classBody(classMethods);
        var classDeclaration = t.classDeclaration(identifier, memberExpression, classBody, []);
        var exportDeclaration = t.exportNamedDeclaration(classDeclaration, []);

        var del = function del(att) {
          delete att.loc;
          delete att.start;
          delete att.end;
        };

        var attr = classMethods[0].body.body[0].argument.openingElement.attributes[0];
        //console.log(classMethods[0].body.body[0].argument.openingElement.attributes[0]);
        console.log(classMethods[0].body.body[0].argument.openingElement);
        del(classMethods[0].body.body[0].argument.openingElement);
        del(classMethods[0].body.body[0].argument);
        del(classMethods[0].body.body[0]);
        del(classMethods[0].body);
        del(attr);
        del(attr.name);
        del(attr.value);
        del(attr.value.expression);
        //console.log(classMethods[0].body.body[0].argument.openingElement.attributes[0]);
        //path.parentPath.replaceWith(exportDeclaration);
      },
      JSXAttribute: function JSXAttribute(path) {
        if (path.node.name.name !== "b") return;
        var bindingText = path.node.value.value;
        var bindingObject = (0, _parseBind2.default)(bindingText);
        for (var binding in bindingObject) {
          var b = _bindings2.default[binding] || _bindings2.default.defaultBinding;
          b.process(bindingObject[binding], path, t, binding);
        }
      },
      JSXOpeningElement: function JSXOpeningElement(path) {
        var helper = new _Helper2.default(path, t);
        var name = path.node.name.name;
        if (name[0] === name[0].toLowerCase()) return;
        helper.addImportDeclaration(name, './' + name + '/' + name, false);
      }
    }
  };
};

var _Helper = require('./Helper');

var _Helper2 = _interopRequireDefault(_Helper);

var _parseBind = require('./parseBind');

var _parseBind2 = _interopRequireDefault(_parseBind);

var _bindings = require('./bindings');

var _bindings2 = _interopRequireDefault(_bindings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }