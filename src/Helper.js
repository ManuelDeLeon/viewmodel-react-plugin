export default class Helper {
  constructor(expressionPath, types){
    this.expressionPath = expressionPath;
    this.types = types;
  }

  isReactMethod(method) {
    const methods = {
      render: 1,
      constructor: 1
    }
    return methods[method] === 1;
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
    for(let declaration of this.programPath().parent.body) {
      if (declaration.type === "ImportDeclaration"){
        for(let specifier of declaration.specifiers) {
          if (specifier.local.name === name){
            return true;
          }
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

      //const rootPath = this.expressionPath.parentPath.parentPath;
      this.rootPath().unshiftContainer('body', this.importDeclaration(name, from, isDefault));
    }
  }
  
  classMethod(name, parameters, statements, kind = 'method', computed = false, isStatic = false) {
    const identifier = this.types.identifier(name);
    const blockStatement = this.types.blockStatement([...statements]);
    return this.types.classMethod( kind, identifier, parameters, blockStatement, computed, isStatic);
  }
  
  returnStatement(argument){
    return this.types.returnStatement(argument);
  }
  
  importDeclaration(name, from, isDefault = true) {
    const identifier = this.types.identifier(name);

    const importSpecifier = isDefault ? this.types.importDefaultSpecifier(identifier) : this.types.importSpecifier(identifier, identifier);
    return this.types.importDeclaration([importSpecifier], this.types.stringLiteral(from));
  }

  classMethodsAndProperties() {
    const p = this.expressionPath;
    const classMethods = [];
    const classProperties = [];
    for(let prop of p.container.expression.arguments[0].properties) {
      if (prop.key.name === "render") {
        let returnBlock;
        if (prop.body.body[0].type === "ReturnStatement") {
          returnBlock = prop.body.body[0].argument;
        } else {
          returnBlock = prop.body.body[0].expression;
        }

        const returnStatement = this.returnStatement(returnBlock);
        const method = this.classMethod('render', [], [returnStatement]);

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
    return [classMethods, classProperties];
  };

  getConstructor(classMethods) {
    for(let method of classMethods) {
      if (method.key.name === "constructor") {
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

  addLoadToClass(classMethods) {
    const memberExpression = this.types.memberExpression(
      this.types.identifier('ViewModel'),
      this.types.identifier('load'),
      false
    );
    const callExpression = this.types.callExpression(
      memberExpression, [this.types.identifier('props'), this.types.thisExpression()]);
    const expressionStatement = this.types.expressionStatement(callExpression);
    const classMethod = this.classMethod('load', [this.types.identifier('props')], [expressionStatement]);
    classMethods.push(classMethod);
  }

  addPropertiesToConstructor(constructor, classProperties) {
    for(let prop of classProperties){
      const propName = prop.key.name;
      const left = this.types.memberExpression(this.types.thisExpression(), this.types.identifier(propName));
      const right = this.types.callExpression(
        this.types.memberExpression(this.types.identifier('ViewModel'), this.types.identifier('prop')),
        [prop.value, this.types.thisExpression()]
      );
      const assignmentExpression = this.types.assignmentExpression('=', left, right);
      const expressionStatement = this.types.expressionStatement(assignmentExpression);
      constructor.body.body.push(expressionStatement);
    }
  }

  addBindingsToConstructor(constructor, classMethods) {
    for(let method of classMethods){
      const methodName = method.key.name;
      if (this.isReactMethod(methodName)) continue;
      const left = this.types.memberExpression(this.types.thisExpression(), this.types.identifier(methodName));
      const rightMember = this.types.memberExpression(this.types.thisExpression(), this.types.identifier(methodName));
      const right = this.types.callExpression(
        this.types.memberExpression(rightMember, this.types.identifier('bind')),
        [this.types.thisExpression()]
      );
      const assignmentExpression = this.types.assignmentExpression('=', left, right);
      const expressionStatement = this.types.expressionStatement(assignmentExpression);
      constructor.body.body.push(expressionStatement);
    }
  }

  prepareConstructor(classMethods, classProperties) {
    let constructor = this.getConstructor(classMethods);
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
    this.addPropertiesToConstructor(constructor, classProperties);
    this.addBindingsToConstructor(constructor, classMethods);
  }

  prepareComponentWillMount(classMethods) {
    const memberExpression1 = this.types.memberExpression(
      this.types.thisExpression(),
      this.types.identifier('load'),
      false
    );
    const memberExpression2 = this.types.memberExpression(
      this.types.thisExpression(),
      this.types.identifier('props'),
      false
    );
    const callExpression = this.types.callExpression(
      memberExpression1, [memberExpression2]);
    const expressionStatement = this.types.expressionStatement(callExpression);
    const classMethod = this.classMethod('componentWillMount', [], [expressionStatement]);
    classMethods.push(classMethod);
  }

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