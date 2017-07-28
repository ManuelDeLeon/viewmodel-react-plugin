import Helper from "./Helper";
import { parseBind, bindToString } from "./parseBind";
import { bindings, getVmCallExpression } from "./bindings";

let ran = false;
let t;
var bad = {
  start: 1,
  end: 1,
  loc: 1
};
function log(obj) {
  console.log(dump(obj));
}
function dump(arr, level) {
  var dumped_text = "";
  if (!level) level = 0;

  var level_padding = "";
  for (var j = 0; j < level + 1; j++) level_padding += "  ";

  if (typeof arr == "object") {
    for (var item in arr) {
      if (bad[item]) continue;
      var value = arr[item];

      if (typeof value == "object") {
        dumped_text += level_padding + "'" + item + "' ...\n";
        dumped_text += dump(value, level + 1);
      } else {
        if (item[0] !== "_") {
          dumped_text += level_padding + "'" + item + "' => \"" + value + '"\n';
        }
      }
    }
  } else {
    dumped_text = "===>" + arr + "<===(" + typeof arr + ")";
  }
  return dumped_text;
}

const isString = function(str) {
  return typeof str === "string" || str instanceof String;
};

const innerVisitor = {
  JSXAttribute(path, state) {
    const helper = new Helper(path, t);
    if (!helper.hasImport("ViewModel")) return;
    if (
      path.node.name.name === "b" &&
      !(path.node.value && path.node.value.value)
    ) {
      path.remove();
    } else if (path.node.name.name === "b") {
      let attributes = {};
      if (state.opts && state.opts.attributes) {
        for (let attr of state.opts.attributes) {
          attributes[attr] = 1;
        }
      }
      const bindingText = path.node.value.value;
      const bindingObject = parseBind(bindingText);
      for (let binding in bindingObject) {
        if (bindings[binding]) {
          bindings[binding].process(
            bindToString(bindingObject[binding]),
            path,
            t,
            binding,
            bindingObject
          );
        } else if (attributes[binding]) {
          bindings.singleAttribute.process(
            bindToString(bindingObject[binding]),
            path,
            t,
            binding,
            bindingObject
          );
        }
      }
      const openingElementPath = path.parentPath;
      const initial = openingElementPath.node.name.name.substr(0, 1);
      if (initial === initial.toLowerCase()) {
        bindings.defaultBinding.process(
          bindingText,
          path,
          t,
          bindings.defaultBinding,
          bindingObject
        );
      }

      if (
        !openingElementPath.node.attributes.some(
          a => a.name && a.name.name === "data-bind"
        )
      ) {
        const jSXAttribute = t.jSXAttribute(
          t.jSXIdentifier("data-bind"),
          t.stringLiteral(path.node.value.value)
        );
        openingElementPath.node.attributes.push(jSXAttribute);
      }

      path.remove();
    } else if (path.node.name.name === "value") {
      let hasBinding = false;
      for (let attribute of path.parent.attributes) {
        if (attribute.name.name === "b") {
          hasBinding = true;
          break;
        }
      }
      if (hasBinding) {
        path.node.name.name = "defaultValue";
      }
    } else if (path.node.name.name === "class") {
      path.node.name.name = "className";
    } else if (path.node.name.name === "for") {
      path.node.name.name = "htmlFor";
    } else if (
      path.node.name.name === "style" &&
      path.node.value.type === "StringLiteral"
    ) {
      for (let attribute of path.parent.attributes) {
        if (attribute.name.name === "b") {
          if (parseBind(attribute.value.value).style) {
            return;
          }
          break;
        }
      }

      let newValue = path.node.value.value;
      if (~newValue.indexOf(";")) {
        newValue = newValue.split(";").join(",");
      }

      const bind = parseBind(newValue);
      const properties = [];
      for (let bindName in bind) {
        if (!bindName) continue;
        let newName = helper.reactStyle(bindName);
        let identifier = t.identifier(newName);
        let withoutQuotes = helper.removeQuotes(bind[bindName]);
        let objectProperty = t.objectProperty(
          identifier,
          t.stringLiteral(withoutQuotes)
        );
        properties.push(objectProperty);
      }
      const objectExpression = t.objectExpression(properties);
      const jSXExpressionContainer = t.jSXExpressionContainer(objectExpression);
      path.node.value = jSXExpressionContainer;
    }
  },

  JSXOpeningElement(path) {
    const helper = new Helper(path, t);
    if (!helper.hasImport("ViewModel")) return;
    const name = path.node.name.name;
    if (!path.node.name.name || name[0] === name[0].toLowerCase()) return;
    helper.addParentAttribute();
    if (name === "VmLazyL") return;
    if (!path.scope.hasBinding(name)) {
      helper.addImportDeclaration(name, "./" + name + "/" + name, false);
    }
  }
};

const elementVisitor = {
  JSXElement(path, state) {
    const helper = new Helper(path, t);
    if (!helper.hasImport("ViewModel")) return;
    let hasIf = false;
    let index = -1;
    let bindingText = null;
    let attributes;
    let ran = false;

    for (let attr of path.node.openingElement.attributes) {
      index++;
      if (attr.name && attr.name.name === "b") {
        if (
          !path.node.openingElement.attributes.some(
            a => a.name && a.name.name === "data-bind"
          )
        ) {
          path.node.openingElement.attributes.push(
            t.jSXAttribute(
              t.jSXIdentifier("data-bind"),
              t.stringLiteral(attr.value.value)
            )
          );
        }
        hasIf = true;
        bindingText = attr.value.value;
        const bindingObject = parseBind(bindingText);

        if (bindingObject["if"]) {
          const binding = bindingObject["if"];
          const bindText = bindToString(binding);
          const jSXElement = path.node;
          const callExpression = getVmCallExpression(
            false,
            bindingObject,
            path,
            t,
            "getValue",
            t.stringLiteral(bindText)
          );
          const conditionalExpression = t.conditionalExpression(
            callExpression,
            jSXElement,
            t.nullLiteral()
          );
          if (path.parent.type === "ReturnStatement") {
            path.replaceWith(conditionalExpression);
          } else {
            path.replaceWith(t.jSXExpressionContainer(conditionalExpression));
          }

          delete bindingObject["if"];
          attr.value.value = bindToString(bindingObject);
        }

        if (bindingObject["repeat"]) {
          const binding = bindingObject["repeat"];
          const bindText = bindToString(binding);
          const jSXElement = path.node;

          const callExpressionGetValue = getVmCallExpression(
            true,
            bindingObject,
            path,
            t,
            "getValue",
            t.stringLiteral(bindText)
          );

          const memberExpressionMap = t.memberExpression(
            callExpressionGetValue,
            t.identifier("map"),
            false
          );
          const returnStatement = t.returnStatement(jSXElement);
          const blockStatement = t.blockStatement([returnStatement]);

          const arrowFunctionExpression = t.arrowFunctionExpression(
            [t.identifier("repeatObject"), t.identifier("repeatIndex")],
            blockStatement
          );

          const callExpressionMap = t.callExpression(memberExpressionMap, [
            arrowFunctionExpression
          ]);
          const jSXExpressionContainer = t.jSXExpressionContainer(
            callExpressionMap
          );

          const initial = jSXElement.openingElement.name.name[0];
          if (initial === initial.toUpperCase()) {
            const jSXSpreadAttribute = t.jSXSpreadAttribute(
              t.identifier("repeatObject")
            );
            jSXElement.openingElement.attributes.push(jSXSpreadAttribute);
          }

          let jSXExpressionContainerKey;
          if (bindingObject.key) {
            const memberExpressionKey = t.memberExpression(
              t.identifier("repeatObject"),
              t.identifier(bindingObject.key)
            );
            jSXExpressionContainerKey = t.jSXExpressionContainer(
              memberExpressionKey
            );
          } else {
            jSXExpressionContainerKey = t.jSXExpressionContainer(
              t.identifier("repeatIndex")
            );
          }

          const jSXAttribute = t.jSXAttribute(
            t.jSXIdentifier("key"),
            jSXExpressionContainerKey
          );
          jSXElement.openingElement.attributes.push(jSXAttribute);
          attributes = jSXElement.openingElement.attributes;

          if (path.parent.type === "ConditionalExpression") {
            path.replaceWith(callExpressionMap);
          } else {
            path.replaceWith(jSXExpressionContainer);
          }

          delete bindingObject["repeat"];
          delete bindingObject["key"];
          attr.value.value = bindToString(bindingObject);
        }

        if (bindingObject["defer"]) {
          const binding = bindingObject["defer"];
          const bindText = bindToString(binding);
          const jSXElement = path.node;
          const replacement =
            state.opts && state.opts.deferWithRequire
              ? bindings.defer.getReplacementWithRequire(
                  jSXElement,
                  t,
                  bindingObject,
                  path,
                  bindText
                )
              : bindings.defer.getReplacement(
                  jSXElement,
                  t,
                  bindingObject,
                  path,
                  bindText
                );
          path.replaceWith(replacement);
          delete bindingObject["defer"];
          attr.value.value = bindToString(bindingObject);
        }
      }
    }
  }
};

export default function({ types }) {
  return {
    visitor: {
      CallExpression(path, state) {
        t = types;
        const helper = new Helper(path, t);

        // Only do this if we find a view model (not declared already)
        if (path.scope.hasBinding(helper.vmName()) || !helper.isViewModel())
          return;

        if (state.opts && state.opts.useInferno) {
          helper.addImportDeclaration("Inferno", "inferno");
          helper.addImportDeclaration("Component", "inferno-component");
        } else {
          helper.addImportDeclaration("React", "react");
        }

        helper.addImportDeclaration("ViewModel", "viewmodel-react");
        helper.addVariableDeclaration();

        let [
          initialMethods,
          initialProperties
        ] = helper.initialMethodsAndProperties();

        const componentName = path.node.callee.name;
        helper.prepareConstructor(
          componentName,
          initialMethods,
          initialProperties
        );
        const classMethods = helper.classMethods(initialMethods);

        const identifier = t.identifier(componentName);
        const objectIdentifier = t.identifier("React");
        const propertyIdentifier = t.identifier("Component");
        const memberExpression = t.memberExpression(
          objectIdentifier,
          propertyIdentifier,
          false
        );
        const extended =
          state.opts && state.opts.useInferno
            ? propertyIdentifier
            : memberExpression;
        const classBody = t.classBody(classMethods);
        const classDeclaration = t.classDeclaration(
          identifier,
          extended,
          classBody,
          []
        );
        const exportDeclaration = t.exportNamedDeclaration(
          classDeclaration,
          []
        );
        path.parentPath.replaceWith(exportDeclaration);

        path.parentPath.traverse(elementVisitor, state);

        path.parentPath.traverse(innerVisitor, state);
      }
    }
  };
}
