"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      CallExpression: function CallExpression(p) {
        // Only do this if we find a view model
        if (notViewModel(p)) return;

        // Add "import React from 'react';" if the variable React isn't defined
        var rootPath = p.parentPath.parentPath;
        if (!isDefined(rootPath, 'React')) {
          addReactImport(rootPath, t);
        }

        var classContents = [];
        extractMethods(p, t, classContents);

        var componentName = p.node.callee.name;
        var identifier = t.identifier(componentName);
        var objectIdentifier = t.identifier('React');
        var propertyIdentifier = t.identifier('Component');
        var memberExpression = t.memberExpression(objectIdentifier, propertyIdentifier, false);
        var classBody = t.classBody(classContents);
        var classDeclaration = t.classDeclaration(identifier, memberExpression, classBody, []);
        var exportDeclaration = t.exportNamedDeclaration(classDeclaration, []);
        p.replaceWith(exportDeclaration);
      }
    }
  };
};

var displayMembers = function displayMembers(obj, match) {
  console.log("vvvvvvvvvvvvv ( ${match} ) vvvvvvvvvvvvv");
  for (var prop in obj) {
    if (~prop.toLowerCase().indexOf(match.toLowerCase())) {
      console.log(prop);
    }
  }
  console.log("^^^^^^^^^^^^^ ( ${match} ) ^^^^^^^^^^^^^");
};

var findMembers = function findMembers(obj, match, depth) {
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
};

var isDefined = function isDefined(p, variable) {
  return p.scope.hasOwnBinding(variable);
};
var noName = function noName(p) {
  return !p.node.callee.name;
};
var notExpressionStatement = function notExpressionStatement(p) {
  return p.parent.type !== "ExpressionStatement";
};
var notAtRoot = function notAtRoot(p) {
  return p.parentPath.parent.type !== "Program";
};
var notCapitalized = function notCapitalized(p) {
  return p.node.callee.name[0] === p.node.callee.name[0].toLowerCase();
};
var defined = function defined(p) {
  return isDefined(p, p.node.callee.name);
};
var incorrectArguments = function incorrectArguments(p) {
  return p.node.arguments.length !== 1 || p.node.arguments[0].type !== "ObjectExpression";
};
var noRender = function noRender(p) {
  return !p.node.arguments[0].properties.some(function (p) {
    return p.type === "ObjectMethod" && p.key.name === "render";
  });
};

var notViewModel = function notViewModel(p) {
  return noName(p) || notExpressionStatement(p) || notAtRoot(p) || notCapitalized(p) || incorrectArguments(p) || noRender(p) || defined(p);
};

var addReactImport = function addReactImport(path, t) {
  var identifier = t.identifier('React');
  var importDefaultSpecifier = t.importDefaultSpecifier(identifier);
  var importDeclaration = t.importDeclaration([importDefaultSpecifier], t.stringLiteral('react'));
  path.unshiftContainer('body', importDeclaration);
};

var getReturnStatement = function getReturnStatement(t, returnBlock) {
  //displayMembers(t, "jsxelement");
  var jsxIdentifier = t.jSXIdentifier('div');
  var jsxOpeningElement = t.jSXOpeningElement(jsxIdentifier, [], true);
  var jsxElement = t.jSXElement(jsxOpeningElement, null, [], true);
  var returnStatement = t.returnStatement(returnBlock);
  return returnStatement;
};

var getMethod = function getMethod(t, returnBlock) {
  var identifier = t.identifier('render');
  var returnStatement = getReturnStatement(t, returnBlock);
  var blockStatement = t.blockStatement([returnStatement]);
  var methodDefinition = t.classMethod('method', identifier, [], t.blockStatement([returnStatement]), false, false);
  return methodDefinition;
};

var extractMethods = function extractMethods(p, t, classContents) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = p.container.expression.arguments[0].properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var prop = _step.value;

      if (prop.key.name === "render") {
        var returnBlock = void 0;
        if (prop.body.body[0].type === "ReturnStatement") {
          returnBlock = prop.body.body[0].argument;
        } else {
          returnBlock = prop.body.body[0].expression;
        }

        var method = getMethod(t, returnBlock);
        classContents.push(method);
      } else {
        if (prop.kind === "method") {
          prop.type = "ClassMethod";
          classContents.push(prop);
        } else {
          // Do something with the property
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
};