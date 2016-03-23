"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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
    key: "isReactMethod",
    value: function isReactMethod(method) {
      var methods = {
        render: 1,
        constructor: 1
      };
      return methods[method] === 1;
    }
  }, {
    key: "vmName",
    value: function vmName() {
      return this.expressionPath.node.callee.name;
    }
  }, {
    key: "isViewModel",
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
    key: "hasImport",
    value: function hasImport(name) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.programPath().parent.body[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var declaration = _step.value;

          if (declaration.type === "ImportDeclaration") {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = declaration.specifiers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var specifier = _step2.value;

                if (specifier.local.name === name) {
                  return true;
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

      return false;
    }
  }, {
    key: "programPath",
    value: function programPath() {
      var programPath = this.expressionPath;
      while (programPath.parent.type !== 'Program') {
        programPath = programPath.parentPath;
      }return programPath;
    }
  }, {
    key: "rootPath",
    value: function rootPath() {
      var rootPath = this.expressionPath;
      while (rootPath.parent.type !== 'File') {
        rootPath = rootPath.parentPath;
      }return rootPath;
    }
  }, {
    key: "addImportDeclaration",
    value: function addImportDeclaration(name, from) {
      var isDefault = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      if (!this.hasImport(name)) {

        //const rootPath = this.expressionPath.parentPath.parentPath;
        this.rootPath().unshiftContainer('body', this.importDeclaration(name, from, isDefault));
      }
    }
  }, {
    key: "classMethod",
    value: function classMethod(name, parameters, statements) {
      var kind = arguments.length <= 3 || arguments[3] === undefined ? 'method' : arguments[3];
      var computed = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];
      var isStatic = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];

      var identifier = this.types.identifier(name);
      var blockStatement = this.types.blockStatement([].concat(_toConsumableArray(statements)));
      return this.types.classMethod(kind, identifier, parameters, blockStatement, computed, isStatic);
    }
  }, {
    key: "returnStatement",
    value: function returnStatement(argument) {
      return this.types.returnStatement(argument);
    }
  }, {
    key: "importDeclaration",
    value: function importDeclaration(name, from) {
      var isDefault = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      var identifier = this.types.identifier(name);

      var importSpecifier = isDefault ? this.types.importDefaultSpecifier(identifier) : this.types.importSpecifier(identifier, identifier);
      return this.types.importDeclaration([importSpecifier], this.types.stringLiteral(from));
    }
  }, {
    key: "classMethodsAndProperties",
    value: function classMethodsAndProperties() {
      var p = this.expressionPath;
      var classMethods = [];
      var classProperties = [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = p.container.expression.arguments[0].properties[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var prop = _step3.value;

          if (prop.key.name === "render") {
            var returnBlock = void 0;
            if (prop.body.body[0].type === "ReturnStatement") {
              returnBlock = prop.body.body[0].argument;
            } else {
              returnBlock = prop.body.body[0].expression;
            }

            var returnStatement = this.returnStatement(returnBlock);
            var method = this.classMethod('render', [], [returnStatement]);

            classMethods.push(method);
          } else {

            if (prop.kind === "method") {
              prop.type = "ClassMethod";
              classMethods.push(prop);
            } else {
              classProperties.push(prop);
            }
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

      return [classMethods, classProperties];
    }
  }, {
    key: "getConstructor",
    value: function getConstructor(classMethods) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = classMethods[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var method = _step4.value;

          if (method.key.name === "constructor") {
            return method;
          }
        }
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

      return undefined;
    }
  }, {
    key: "getSuper",
    value: function getSuper() {
      var propsName = arguments.length <= 0 || arguments[0] === undefined ? 'props' : arguments[0];

      var callExpression = this.types.callExpression(this.types.super(), [this.types.identifier(propsName)]);
      var expressionStatement = this.types.expressionStatement(callExpression);
      return expressionStatement;
    }
  }, {
    key: "createConstructor",
    value: function createConstructor() {
      var expressionStatement = this.getSuper();
      return this.classMethod('constructor', [this.types.identifier('props')], [expressionStatement], 'constructor');
    }
  }, {
    key: "addLoadToClass",
    value: function addLoadToClass(classMethods) {
      var memberExpression = this.types.memberExpression(this.types.identifier('ViewModel'), this.types.identifier('load'), false);
      var callExpression = this.types.callExpression(memberExpression, [this.types.identifier('props'), this.types.thisExpression()]);
      var expressionStatement = this.types.expressionStatement(callExpression);
      var classMethod = this.classMethod('load', [this.types.identifier('props')], [expressionStatement]);
      classMethods.push(classMethod);
    }
  }, {
    key: "addPropertiesToConstructor",
    value: function addPropertiesToConstructor(constructor, classProperties) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = classProperties[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var prop = _step5.value;

          var propName = prop.key.name;
          var left = this.types.memberExpression(this.types.thisExpression(), this.types.identifier(propName));
          var right = this.types.callExpression(this.types.memberExpression(this.types.identifier('ViewModel'), this.types.identifier('prop')), [prop.value, this.types.thisExpression()]);
          var assignmentExpression = this.types.assignmentExpression('=', left, right);
          var expressionStatement = this.types.expressionStatement(assignmentExpression);
          constructor.body.body.push(expressionStatement);
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
    }
  }, {
    key: "addBindingsToConstructor",
    value: function addBindingsToConstructor(constructor, classMethods) {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = classMethods[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var method = _step6.value;

          var methodName = method.key.name;
          if (this.isReactMethod(methodName)) continue;
          var left = this.types.memberExpression(this.types.thisExpression(), this.types.identifier(methodName));
          var rightMember = this.types.memberExpression(this.types.thisExpression(), this.types.identifier(methodName));
          var right = this.types.callExpression(this.types.memberExpression(rightMember, this.types.identifier('bind')), [this.types.thisExpression()]);
          var assignmentExpression = this.types.assignmentExpression('=', left, right);
          var expressionStatement = this.types.expressionStatement(assignmentExpression);
          constructor.body.body.push(expressionStatement);
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
    }
  }, {
    key: "prepareConstructor",
    value: function prepareConstructor(classMethods, classProperties) {
      var constructor = this.getConstructor(classMethods);
      if (!constructor) {
        constructor = this.createConstructor();
        classMethods.push(constructor);
      } else {
        if (constructor.params.length === 0) {
          constructor.params.push(this.types.identifier('props'));
        }
        var _propsName = constructor.params[0].name;
        constructor.body.body.unshift(this.getSuper(_propsName));
      }
      constructor.kind = "constructor";
      this.addPropertiesToConstructor(constructor, classProperties);
      this.addBindingsToConstructor(constructor, classMethods);
    }
  }, {
    key: "prepareComponentWillMount",
    value: function prepareComponentWillMount(classMethods) {
      var memberExpression1 = this.types.memberExpression(this.types.thisExpression(), this.types.identifier('load'), false);
      var memberExpression2 = this.types.memberExpression(this.types.thisExpression(), this.types.identifier('props'), false);
      var callExpression = this.types.callExpression(memberExpression1, [memberExpression2]);
      var expressionStatement = this.types.expressionStatement(callExpression);
      var classMethod = this.classMethod('componentWillMount', [], [expressionStatement]);
      classMethods.push(classMethod);
    }
  }, {
    key: "displayMembers",
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
    key: "findMembers",
    value: function (_findMembers) {
      function findMembers(_x, _x2, _x3) {
        return _findMembers.apply(this, arguments);
      }

      findMembers.toString = function () {
        return _findMembers.toString();
      };

      return findMembers;
    }(function (obj, match, depth) {
      var indent = arguments.length <= 3 || arguments[3] === undefined ? "" : arguments[3];

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