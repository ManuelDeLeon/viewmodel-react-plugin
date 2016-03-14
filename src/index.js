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

export default function ({types: t }) {
  return {
    visitor: {
      CallExpression(p) {
        if (notViewModel(p) ) return;
        // Add "import React from 'react';" if the variable React isn't defined
        const rootPath = p.parentPath.parentPath;
        if (!isDefined(rootPath, 'React')) {
          addReactImport(rootPath, t);
        }
        console.log(p.node.callee.name);

        // console.log(p.node.body);
        //p.node.insertBefore("XXX");
        //p.node.callee.name = p.node.callee.name + "_XXX";
        //console.log(p.node.arguments[0].properties);
        //console.log("=======================================================================");
      }
    }
  };
}