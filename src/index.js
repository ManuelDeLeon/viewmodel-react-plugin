const displayMembers = (obj, match) => {
  console.log("vvvvvvvvvvvvv ( ${match} ) vvvvvvvvvvvvv");
  for(let prop in obj) {
    if (~prop.toLowerCase().indexOf(match.toLowerCase())) {
      console.log(prop);
    }
  }
  console.log("^^^^^^^^^^^^^ ( ${match} ) ^^^^^^^^^^^^^");
};

const findMembers = (obj, match, depth, indent = "") => {
  if (depth === 0) return;
  if (indent === "") console.log("vvvvvvvvvvvvv ( ${match} ) vvvvvvvvvvvvv");
  for(let prop in obj) {
    if (~prop.toLowerCase().indexOf(match.toLowerCase())) {
      console.log(indent + prop);
    }
    if( (typeof obj[prop] === "object") && (obj[prop] !== null) )
    {
      findMembers(obj[prop], match, depth - 1, indent + "  ")
    }
  }
  if (indent === "") console.log("^^^^^^^^^^^^^ ( ${match} ) ^^^^^^^^^^^^^");
};

const isDefined = (p, variable) => p.scope.hasOwnBinding(variable);
const noName = p => !p.node.callee.name;
const notExpressionStatement = p => p.parent.type !== "ExpressionStatement";
const notAtRoot = p => p.parentPath.parent.type !== "Program";
const notCapitalized = p => p.node.callee.name[0] === p.node.callee.name[0].toLowerCase();
const defined = p => isDefined(p, p.node.callee.name);
const incorrectArguments = p => p.node.arguments.length !== 1 || p.node.arguments[0].type !== "ObjectExpression"
const noRender = p => !p.node.arguments[0].properties.some( p => p.type === "ObjectMethod" && p.key.name === "render");

const notViewModel = function(p) {
  return (
    noName(p)
    || notExpressionStatement(p)
    || notAtRoot(p)
    || notCapitalized(p)
    || incorrectArguments(p)
    || noRender(p)
    || defined(p)
  );
};

const addReactImport = (path, t) => {
  const identifier = t.identifier('React');
  const importDefaultSpecifier = t.importDefaultSpecifier(identifier);
  const importDeclaration = t.importDeclaration([importDefaultSpecifier], t.stringLiteral('react'));
  path.unshiftContainer('body', importDeclaration);
};

const getReturnStatement = (t, returnBlock) => {
  //displayMembers(t, "jsxelement");
  const jsxIdentifier = t.jSXIdentifier('div');
  const jsxOpeningElement = t.jSXOpeningElement(jsxIdentifier, [], true);
  const jsxElement = t.jSXElement(jsxOpeningElement, null, [], true);
  const returnStatement = t.returnStatement(returnBlock);
  return returnStatement;
};

const getMethod = (t, returnBlock) => {
  const identifier = t.identifier('render');
  const returnStatement = getReturnStatement(t, returnBlock);
  const blockStatement = t.blockStatement([returnStatement]);
  const methodDefinition = t.classMethod( 'method', identifier, [], t.blockStatement([returnStatement]), false, false);
  return methodDefinition;
};

const extractMethods = (p, t, classContents) => {
  for(let prop of p.container.expression.arguments[0].properties) {
    if (prop.key.name === "render") {
      let returnBlock;
      if (prop.body.body[0].type === "ReturnStatement") {
        returnBlock = prop.body.body[0].argument;
      } else {
        returnBlock = prop.body.body[0].expression;
      }

      const method = getMethod(t, returnBlock);
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
};


export default function ({types: t }) {
  return {
    visitor: {
      CallExpression(p) {
        // Only do this if we find a view model
        if (notViewModel(p) ) return;

        // Add "import React from 'react';" if the variable React isn't defined
        const rootPath = p.parentPath.parentPath;
        if (!isDefined(rootPath, 'React')) {
          addReactImport(rootPath, t);
        }

        const classContents = [];
        extractMethods(p, t, classContents);

        const componentName = p.node.callee.name;
        const identifier = t.identifier(componentName);
        const objectIdentifier = t.identifier('React');
        const propertyIdentifier = t.identifier('Component');
        const memberExpression = t.memberExpression(objectIdentifier, propertyIdentifier, false);
        const classBody = t.classBody(classContents);
        const classDeclaration = t.classDeclaration(identifier, memberExpression, classBody, []);
        const exportDeclaration = t.exportNamedDeclaration(classDeclaration, []);
        p.replaceWith(exportDeclaration);
      }
    }
  };
}