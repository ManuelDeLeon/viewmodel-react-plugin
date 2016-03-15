import Helper from './Helper'
export default function ({types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        const helper = new Helper(path, t);

        // Only do this if we find a view model (not declared already)
        if (path.scope.hasBinding(helper.vmName()) || !helper.isViewModel() ) return;

        helper.addImportDeclaration('React', 'react');

        const [classMethods, classProperties] = helper.classMethodsAndProperties()
        
        helper.addConstructor(classMethods);

        const componentName = path.node.callee.name;
        const identifier = t.identifier(componentName);
        const objectIdentifier = t.identifier('React');
        const propertyIdentifier = t.identifier('Component');
        const memberExpression = t.memberExpression(objectIdentifier, propertyIdentifier, false);
        const classBody = t.classBody(classMethods);
        const classDeclaration = t.classDeclaration(identifier, memberExpression, classBody, []);
        const exportDeclaration = t.exportNamedDeclaration(classDeclaration, []);
        path.replaceWith(exportDeclaration);
      }
    }
  };
}