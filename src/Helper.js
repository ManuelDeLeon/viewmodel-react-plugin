export default class Helper {
  constructor(expressionPath, types){
    this.expressionPath = expressionPath;
    this.types = types;
  }

  isString(str) { return typeof str === 'string' || str instanceof String; }
  
  removeQuotes(str) {
    if (!str || !this.isString(str) || !( str[0] === '"' || str[0] === "'")) return str;
    return str.substr(1, str.length - 2);
  }

  reactStyle(str) {
    if(!~str.indexOf('-')) return str;
    let retVal = "";
    for(let block of str.split('-')) {
      if (retVal) {
        retVal += block[0].toUpperCase() + block.substr(1);
      } else {
        retVal += block;
      }
    }
    return retVal;
  }

  isReactMethod(method) {
    const methods = {
      render: 1,
      constructor: 1,
      // getInitialState: 1,
      // getDefaultProps: 1,
      // propTypes: 1,
      // mixins : 1,
      // statics : 1,
      // displayName : 1,
      componentWillReceiveProps : 1,
      shouldComponentUpdate : 1,
      componentWillUpdate : 1,
      componentDidUpdate : 1,
      componentWillMount: 1,
      componentDidMount: 1,
      componentWillUnmount: 1
    }
    return methods[method];
  }

  isViewModelMethod(method) {
    const methods = {
      autorun: 1
    }

    return methods[method] && methods.hasOwnProperty(method);
  }

  vmName() {
    return this.expressionPath.node.callee.name;
  }
  
  isViewModel(){
    const p = this.expressionPath;
    return (
      this.vmName() // hasName
      && p.parent.type === "ExpressionStatement" // isExpressionStatement
      && p.parentPath.parent.type === "Program" // atRoot
      && p.node.callee.name[0] !== p.node.callee.name[0].toLowerCase() // capitalized
      && p.node.arguments.length === 1 && p.node.arguments[0].type === "ObjectExpression" // correctArguments
      && p.node.arguments[0].properties.some( p => p.type === "ObjectMethod" && p.key.name === "render") // hasRender
    );
  }

  hasImport(name){
    for(let declaration of this.rootPath().node.body) {
      if (declaration.type === "ImportDeclaration"){
        for(let specifier of declaration.specifiers) {
          if (specifier.local.name === name){
            return true;
          }
        }
      } else if (declaration.type === "ExportNamedDeclaration"){
        if (declaration.declaration.id && declaration.declaration.id.name === name){
          return true;
        }
      } else if (declaration.type === "ClassDeclaration"){
        if (declaration.id && declaration.id.name === name){
          return true;
        }
      }
    }
    return false;
  }

  programPath() {
    let programPath = this.expressionPath;
    while (programPath.parent.type !== 'Program') programPath = programPath.parentPath;
    return programPath;
  }

  rootPath() {
    let rootPath = this.expressionPath;
    while (rootPath.parent.type !== 'File') rootPath = rootPath.parentPath;
    return rootPath;
  }

  addImportDeclaration(name, from, isDefault = true){
    if ( !this.hasImport(name)) {
      const importDeclaration = this.importDeclaration(name, from, isDefault);
      this.rootPath().node.body.unshift(importDeclaration);
      //this.rootPath().unshiftContainer('body', this.importDeclaration(name, from, isDefault));
    }
  }
  
  classMethod(name, parameters, statements, kind = 'method', computed = false, isStatic = false) {
    const identifier = this.types.identifier(name);
    const blockStatement = this.types.blockStatement([...statements]);
    return this.types.classMethod( kind, identifier, parameters, blockStatement, computed, isStatic);
  }

  importDeclaration(name, from, isDefault = true) {
    const identifier = this.types.identifier(name);

    const importSpecifier = isDefault ? this.types.importDefaultSpecifier(identifier) : this.types.importSpecifier(identifier, identifier);
    return this.types.importDeclaration([importSpecifier], this.types.stringLiteral(from));
  }

  initialMethodsAndProperties() {
    const p = this.expressionPath;
    const initialMethods = [];
    const initialProperties = [];
    for(let prop of p.container.expression.arguments[0].properties) {
      if (prop.kind === "method") {
        initialMethods.push(prop);
      } else {
        initialProperties.push(prop);
      }
    }
    // Make sure the methods are recreated (specially the render)
    p.container.expression.arguments.length = 0;
    return [initialMethods, initialProperties];
  };

  getMethod(methodName, classMethods) {
    for(let method of classMethods) {
      if (method.key.name === methodName) {
        return method;
      }
    }
    return undefined;
  }

  getSuper(propsName = 'props') {
    const callExpression = this.types.callExpression(this.types.super(), [this.types.identifier(propsName)]);
    const expressionStatement = this.types.expressionStatement(callExpression);
    return expressionStatement;
  }
  
  createConstructor() {
    const expressionStatement = this.getSuper();
    return this.classMethod( 'constructor', [this.types.identifier('props')], [expressionStatement], 'constructor' );
  }

  addPrepareComponentToConstructor(constructor, componentName, initialObject) {
    const memberExpression = this.types.memberExpression(
      this.types.identifier('ViewModel'),
      this.types.identifier('prepareComponent')
    )
    const callExpression = this.types.callExpression(memberExpression, [this.types.stringLiteral(componentName), this.types.thisExpression(), initialObject]);
    const expressionStatement = this.types.expressionStatement(callExpression);
    constructor.body.body.push(expressionStatement);
  }

  getInitialObject(classMethods, classProperties) {
    const initialObject = this.types.objectExpression(classProperties);
    for(let method of classMethods){
      if (! this.isReactMethod(method.key.name)  ) {
        initialObject.properties.push(method);
      }

    }
    return initialObject;
  }

  prepareConstructor(componentName, classMethods, classProperties) {
    let constructor = this.getMethod("constructor", classMethods);
    if (!constructor) {
      constructor = this.createConstructor();
      classMethods.push(constructor);
    } else {
      if (constructor.params.length === 0) {
        constructor.params.push( this.types.identifier('props') );
      }
      const propsName = constructor.params[0].name;
      constructor.body.body.unshift( this.getSuper(propsName) );
    }
    constructor.kind = "constructor";
    const initialObject = this.getInitialObject(classMethods, classProperties);
    this.addPrepareComponentToConstructor(constructor, componentName, initialObject);
  }

  addParentAttribute(){
    this.expressionPath.node.attributes.unshift(
      this.types.jSXAttribute(
        this.types.jSXIdentifier('data-vm-parent'),
        this.types.jSXExpressionContainer(this.types.thisExpression())
      )
    );
  }

  classMethods(initialMethods) {
    const newMethods = [];
    for(let method of initialMethods) {
      if (this.isReactMethod(method.key.name) && !this.isViewModelMethod(method.key.name) ) {
        if (method.key.name === "render") {
          let returnBlock;
          if (method.body.body[0].type === "ReturnStatement") {
            returnBlock = method.body.body[0].argument;
          } else {
            returnBlock = method.body.body[0].expression;
          }
          const returnStatement = this.types.returnStatement(returnBlock);
          const newMethod = this.classMethod('render', [], [returnStatement]);
          newMethods.push(newMethod);
        } else {
          method.type = "ClassMethod";
          newMethods.push(method);
        }
      }
    }
    return newMethods;
  }

  /////////////////////////////////

  displayMembers(obj, match) {
    console.log("vvvvvvvvvvvvv ( ${match} ) vvvvvvvvvvvvv");
    for(let prop in obj) {
      if (~prop.toLowerCase().indexOf(match.toLowerCase())) {
        console.log(prop);
      }
    }
    console.log("^^^^^^^^^^^^^ ( ${match} ) ^^^^^^^^^^^^^");
  };

  findMembers(obj, match, depth, indent = "") {
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
}