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

const getMethod = t => {
  const identifier = t.identifier('one');
  const blockStatement = t.blockStatement([]);
  const blankIdentifier = t.identifier("");
  const functionExpression = t.functionExpression(blankIdentifier, [], blockStatement, false);
  const methodDefinition = t.classMethod( 'method', identifier, [], t.blockStatement([]), false, false);
  return methodDefinition;
};

const displayMembers = (obj, match) => {
  console.log("vvvvvvvvvvvvv ( ${match} ) vvvvvvvvvvvvv");
  for(let prop in obj) {
    if (~prop.toLowerCase().indexOf(match.toLowerCase())) {
      console.log(prop);
    }
  }
  console.log("^^^^^^^^^^^^^ ( ${match} ) ^^^^^^^^^^^^^");
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
        const componentName = p.node.callee.name;
        const identifier = t.identifier(componentName);
        const objectIdentifier = t.identifier('React');
        const propertyIdentifier = t.identifier('Component');
        const memberExpression = t.memberExpression(objectIdentifier, propertyIdentifier, false);
        //const method = getMethod(t);
        const classBody = t.classBody([]);
        const classDeclaration = t.classDeclaration(identifier, memberExpression, classBody, []);
        //displayMembers(t, "export");
        const exportDeclaration = t.exportNamedDeclaration(classDeclaration, []);
        p.replaceWith(exportDeclaration);
      }
    }
  };
}