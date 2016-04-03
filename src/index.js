import Helper from './Helper'
import parseBind from './parseBind'
import bindings from './bindings'

var bad = {
  start: 1, end: 1, loc: 1
}
function dump(arr,level) {
  var dumped_text = "";
  if(!level) level = 0;

  var level_padding = "";
  for(var j=0;j<level+1;j++) level_padding += "  ";

  if(typeof(arr) == 'object') {
    for(var item in arr) {
      if (bad[item]) continue;
      var value = arr[item];

      if(typeof(value) == 'object') {
        dumped_text += level_padding + "'" + item + "' ...\n";
        dumped_text += mydump(value,level+1);
      } else {
        if (item[0] !== '_') {
          dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
        }
      }
    }
  } else {
    dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
  }
  return dumped_text;
};

export default function ({types: t }) {
  return {
    visitor: {
      CallExpression(path){
        const helper = new Helper(path, t);

        // Only do this if we find a view model (not declared already)
        if (path.scope.hasBinding(helper.vmName()) || !helper.isViewModel()) return;

        helper.addImportDeclaration('React', 'react');
        helper.addImportDeclaration('ViewModel', 'viewmodel-react');

        let [classMethods, classProperties] = helper.classMethodsAndProperties()

        helper.prepareConstructor(classMethods, classProperties);
        helper.prepareComponentDidMount(classMethods, classProperties);
        //helper.prepareComponentWillMount(classMethods);   
        //helper.prepareComponentWillUnmount(classMethods);
        //helper.prepareShouldComponentUpdate(classMethods);
        //helper.addLoadToClass(classMethods);
        classMethods = helper.removeViewModelMethods(classMethods);
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
          let b = bindings[binding] || bindings.defaultBinding;
          b.process(bindingObject[binding], path, t, binding);
        }
      },

      JSXOpeningElement(path){
        const helper = new Helper(path, t);
        const name = path.node.name.name;
        if (name[0] === name[0].toLowerCase()) return;
        helper.addParentAttribute();
        if (!path.scope.hasBinding(name)) {
          helper.addImportDeclaration(name, './' + name + '/' + name, false);
        }
      }

    }
  };
}