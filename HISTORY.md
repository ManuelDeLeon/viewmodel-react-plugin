# 3.1.3

* Fix: Depend on babel-plugin-syntax-dynamic-import.
* Fix: Wrap deferred blocks in an expression container.

# 3.1.0

* Add Inferno compatibility. Just set the option "useInferno": true on the "viewmodel-react-plugin" section of .babelrc. See [Inferno](https://viewmodel.org/#BasicsInferno) for more information.

# 3.0.5

* Fix using components with dots in their declaration

# 3.0.2

* Fix if + repeat bindings when used together

# 3.0.1

* Don't remove if from data-bind

# 3.0.0

* defer binding now uses ES dynamic import statements by default. To get the Webpack 1 compatible behavior back add the option "deferWithRequire": true on the "viewmodel-react-plugin" section of .babelrc

# 2.0.2

* Fix export declarations.

# 2.0.1

* Better SSR support

# 2.0.0

* Rename deferUntil to just "defer"

# 1.0.0

* Add deferUntil binding to load a component on the client only if a condition is met.
