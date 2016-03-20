import Helper from './Helper'
import parseBind from './parseBind'
import bindings from './bindings'
export default function ({types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        const helper = new Helper(path, t);

        // Only do this if we find a view model (not declared already)
        if (path.scope.hasBinding(helper.vmName()) || !helper.isViewModel() ) return;

        helper.addImportDeclaration('React', 'react');
        helper.addImportDeclaration('ViewModel', 'viewmodel-react');

        const [classMethods, classProperties] = helper.classMethodsAndProperties()
        
        helper.prepareConstructor(classMethods, classProperties);

        const componentName = path.node.callee.name;
        const identifier = t.identifier(componentName);
        const objectIdentifier = t.identifier('React');
        const propertyIdentifier = t.identifier('Component');
        const memberExpression = t.memberExpression(objectIdentifier, propertyIdentifier, false);
        const classBody = t.classBody(classMethods);
        const classDeclaration = t.classDeclaration(identifier, memberExpression, classBody, []);
        const exportDeclaration = t.exportNamedDeclaration(classDeclaration, []);
        path.parentPath.replaceWith(exportDeclaration);
      },
      JSXAttribute(path) {
        if (path.node.name.name !== "b") return;
        const bindingText = path.node.value.value;
        const bindingObject = parseBind(bindingText);
        for (let binding in bindingObject) {
          bindings[binding].process(bindingObject[binding], path, t);
        }
      }
    }
  };
}