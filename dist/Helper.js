'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Helper = function () {
  function Helper(expressionPath, types) {
    _classCallCheck(this, Helper);

    this.expressionPath = expressionPath;
    this.types = types;
  }

  _createClass(Helper, [{
    key: 'isString',
    value: function isString(str) {
      return typeof str === 'string' || str instanceof String;
    }
  }, {
    key: 'removeQuotes',
    value: function removeQuotes(str) {
      if (!str || !this.isString(str) || !(str[0] === '"' || str[0] === "'")) return str;
      return str.substr(1, str.length - 2);
    }
  }, {
    key: 'reactStyle',
    value: function reactStyle(str) {
      if (!~str.indexOf('-')) return str;
      var retVal = "";
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = str.split('-')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var block = _step.value;

          if (!block) continue;
          if (!retVal && (block.toLowerCase() === "ms" || str.substr(0, 1) !== "-")) {
            retVal += block.toLowerCase();
          } else {
            retVal += block[0].toUpperCase() + block.substr(1).toLowerCase();
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

      return retVal;
    }
  }, {
    key: 'isReactMethod',
    value: function isReactMethod(method) {
      var methods = {
        render: 1,
        constructor: 1,
        // getInitialState: 1,
        // getDefaultProps: 1,
        // propTypes: 1,
        // mixins : 1,
        // statics : 1,
        // displayName : 1,
        componentWillReceiveProps: 1,
        shouldComponentUpdate: 1,
        componentWillUpdate: 1,
        componentDidUpdate: 1,
        componentWillMount: 1,
        componentDidMount: 1,
        componentWillUnmount: 1
      };
      return methods[method];
    }
  }, {
    key: 'isViewModelMethod',
    value: function isViewModelMethod(method) {
      var methods = {
        autorun: 1
      };

      return methods[method] && methods.hasOwnProperty(method);
    }
  }, {
    key: 'vmName',
    value: function vmName() {
      return this.expressionPath.node.callee.name;
    }
  }, {
    key: 'isViewModel',
    value: function isViewModel() {
      var p = this.expressionPath;
      return this.vmName() // hasName
      && p.parent.type === "ExpressionStatement" // isExpressionStatement
      && p.parentPath.parent.type === "Program" // atRoot
      && p.node.callee.name[0] !== p.node.callee.name[0].toLowerCase() // capitalized
      && p.node.arguments.length === 1 && p.node.arguments[0].type === "ObjectExpression" // correctArguments
      && p.node.arguments[0].properties.some(function (p) {
        return p.type === "ObjectMethod" && p.key.name === "render";
      }) // hasRender
      ;
    }
  }, {
    key: 'hasImport',
    value: function hasImport(name) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.rootPath().node.body[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var declaration = _step2.value;

          if (declaration.type === "ImportDeclaration") {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = declaration.specifiers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var specifier = _step3.value;

                if (specifier.local.name === name) {
                  return true;
                }
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }
          } else if (declaration.type === "ExportNamedDeclaration") {
            if (declaration.declaration && declaration.declaration.id && declaration.declaration.id.name === name) {
              return true;
            }
          } else if (declaration.type === "ClassDeclaration") {
            if (declaration.id && declaration.id.name === name) {
              return true;
            }
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

      return false;
    }
  }, {
    key: 'programPath',
    value: function programPath() {
      var programPath = this.expressionPath;
      while (programPath.parent.type !== 'Program') {
        programPath = programPath.parentPath;
      }return programPath;
    }
  }, {
    key: 'rootPath',
    value: function rootPath() {
      var rootPath = this.expressionPath;
      while (rootPath.parent.type !== 'File') {
        rootPath = rootPath.parentPath;
      }return rootPath;
    }
  }, {
    key: 'addImportDeclaration',
    value: function addImportDeclaration(name, from) {
      var isDefault = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      if (!this.hasImport(name)) {
        var importDeclaration = this.importDeclaration(name, from, isDefault);
        this.rootPath().node.body.unshift(importDeclaration);
        //this.rootPath().unshiftContainer('body', this.importDeclaration(name, from, isDefault));
      }
    }
  }, {
    key: 'classMethod',
    value: function classMethod(name, parameters, statements) {
      var kind = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'method';
      var computed = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var isStatic = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

      var identifier = this.types.identifier(name);
      var blockStatement = this.types.blockStatement([].concat(_toConsumableArray(statements)));
      return this.types.classMethod(kind, identifier, parameters, blockStatement, computed, isStatic);
    }
  }, {
    key: 'importDeclaration',
    value: function importDeclaration(name, from) {
      var isDefault = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      var identifier = this.types.identifier(name);

      var importSpecifier = isDefault ? this.types.importDefaultSpecifier(identifier) : this.types.importSpecifier(identifier, identifier);
      return this.types.importDeclaration([importSpecifier], this.types.stringLiteral(from));
    }
  }, {
    key: 'initialMethodsAndProperties',
    value: function initialMethodsAndProperties() {
      var p = this.expressionPath;
      var initialMethods = [];
      var initialProperties = [];
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = p.container.expression.arguments[0].properties[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var prop = _step4.value;

          if (prop.kind === "method") {
            initialMethods.push(prop);
          } else {
            initialProperties.push(prop);
          }
        }
        // Make sure the methods are recreated (specially the render)
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      p.container.expression.arguments.length = 0;
      return [initialMethods, initialProperties];
    }
  }, {
    key: 'getMethod',
    value: function getMethod(methodName, classMethods) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = classMethods[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var method = _step5.value;

          if (method.key.name === methodName) {
            return method;
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return undefined;
    }
  }, {
    key: 'getSuper',
    value: function getSuper() {
      var propsName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'props';

      var callExpression = this.types.callExpression(this.types.super(), [this.types.identifier(propsName)]);
      var expressionStatement = this.types.expressionStatement(callExpression);
      return expressionStatement;
    }
  }, {
    key: 'createConstructor',
    value: function createConstructor() {
      var expressionStatement = this.getSuper();
      return this.classMethod('constructor', [this.types.identifier('props')], [expressionStatement], 'constructor');
    }
  }, {
    key: 'addPrepareComponentToConstructor',
    value: function addPrepareComponentToConstructor(constructor, componentName, initialObject) {
      var memberExpression = this.types.memberExpression(this.types.identifier('ViewModel'), this.types.identifier('prepareComponent'));
      var callExpression = this.types.callExpression(memberExpression, [this.types.stringLiteral(componentName), this.types.thisExpression(), initialObject]);
      var expressionStatement = this.types.expressionStatement(callExpression);
      constructor.body.body.push(expressionStatement);
    }
  }, {
    key: 'getInitialObject',
    value: function getInitialObject(classMethods, classProperties) {
      var initialObject = this.types.objectExpression(classProperties);
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = classMethods[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var method = _step6.value;

          if (!this.isReactMethod(method.key.name)) {
            initialObject.properties.push(method);
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return initialObject;
    }
  }, {
    key: 'prepareConstructor',
    value: function prepareConstructor(componentName, classMethods, classProperties) {
      var constructor = this.getMethod("constructor", classMethods);
      if (!constructor) {
        constructor = this.createConstructor();
        classMethods.push(constructor);
      } else {
        if (constructor.params.length === 0) {
          constructor.params.push(this.types.identifier('props'));
        }
        var propsName = constructor.params[0].name;
        constructor.body.body.unshift(this.getSuper(propsName));
      }
      constructor.kind = "constructor";
      var initialObject = this.getInitialObject(classMethods, classProperties);
      this.addPrepareComponentToConstructor(constructor, componentName, initialObject);
    }
  }, {
    key: 'addParentAttribute',
    value: function addParentAttribute() {
      this.expressionPath.node.attributes.unshift(this.types.jSXAttribute(this.types.jSXIdentifier('data-vm-parent'), this.types.jSXExpressionContainer(this.types.thisExpression())));
    }
  }, {
    key: 'classMethods',
    value: function classMethods(initialMethods) {
      var newMethods = [];
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = initialMethods[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var method = _step7.value;

          if (this.isReactMethod(method.key.name) && !this.isViewModelMethod(method.key.name)) {
            if (method.key.name === "render") {
              var returnBlock = void 0;
              if (method.body.body[0].type === "ReturnStatement") {
                returnBlock = method.body.body[0].argument;
              } else {
                returnBlock = method.body.body[0].expression;
              }
              var returnStatement = this.types.returnStatement(returnBlock);
              var newMethod = this.classMethod('render', [], [returnStatement]);
              newMethods.push(newMethod);
            } else {
              method.type = "ClassMethod";
              newMethods.push(method);
            }
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      return newMethods;
    }

    /////////////////////////////////

  }, {
    key: 'displayMembers',
    value: function displayMembers(obj, match) {
      console.log("vvvvvvvvvvvvv ( ${match} ) vvvvvvvvvvvvv");
      for (var prop in obj) {
        if (~prop.toLowerCase().indexOf(match.toLowerCase())) {
          console.log(prop);
        }
      }
      console.log("^^^^^^^^^^^^^ ( ${match} ) ^^^^^^^^^^^^^");
    }
  }, {
    key: 'findMembers',
    value: function (_findMembers) {
      function findMembers(_x, _x2, _x3) {
        return _findMembers.apply(this, arguments);
      }

      findMembers.toString = function () {
        return _findMembers.toString();
      };

      return findMembers;
    }(function (obj, match, depth) {
      var indent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";

      if (depth === 0) return;
      if (indent === "") console.log("vvvvvvvvvvvvv ( ${match} ) vvvvvvvvvvvvv");
      for (var prop in obj) {
        if (~prop.toLowerCase().indexOf(match.toLowerCase())) {
          console.log(indent + prop);
        }
        if (_typeof(obj[prop]) === "object" && obj[prop] !== null) {
          findMembers(obj[prop], match, depth - 1, indent + "  ");
        }
      }
      if (indent === "") console.log("^^^^^^^^^^^^^ ( ${match} ) ^^^^^^^^^^^^^");
    })
  }]);

  return Helper;
}();

exports.default = Helper;