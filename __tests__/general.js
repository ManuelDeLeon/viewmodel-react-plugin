const babel = require("babel-core");
const plugin = require("../dist/");
const assert = require("assert");

it("renders basic app", () => {
  const source = `
    Test({ render() {
      <div />;
    } });
  `;
  const { code } = babel.transform(source, {
    plugins: ["syntax-jsx", plugin.default]
  });
  expect(code).toBe(`import ViewModel from "viewmodel-react";
import React from "react";
var VmLazyL;
export class Test extends React.Component {
  render() {
    return <div />;
  }

  constructor(props) {
    super(props);
    ViewModel.prepareComponent("Test", this, {});
  }

}`);
});

it("renders 2 components", () => {
  const source = `
    Test({ 
      render() {
        <div />;
      } 
    });

    App({ 
      render() {
        <div>
          <Test />
        </div>
      } 
    });
  `;
  const { code } = babel.transform(source, {
    plugins: ["syntax-jsx", plugin.default]
  });

  expect(code).toBe(`import ViewModel from "viewmodel-react";
import React from "react";
var VmLazyL;
export class Test extends React.Component {
  render() {
    return <div />;
  }

  constructor(props) {
    super(props);
    ViewModel.prepareComponent("Test", this, {});
  }

}
export class App extends React.Component {
  render() {
    return <div>
          <Test data-vm-parent={this} />
        </div>;
  }

  constructor(props) {
    super(props);
    ViewModel.prepareComponent("App", this, {});
  }

}`);
});

it("renders with defer nested", () => {
  const source = `
    Test({ render() {
			<div>
				<House b="defer: true" />
			</div>
    } });
  `;
  const { code } = babel.transform(source, {
    plugins: ["syntax-jsx", plugin.default]
  });
  expect(code.replace(new RegExp("\t", "g"), "  "))
    .toBe(`import ViewModel from "viewmodel-react";
import React from "react";
var VmLazyL;
export class Test extends React.Component {
  render() {
    return <div>
        {ViewModel.getValue(this, null, null, "true") && (VmLazyL = this.vmLazyHouse) && <VmLazyL data-vm-parent={this} data-bind="defer: true" /> || import("./House/House").then(m => {
        this.vmLazyHouse = m.House;
        ViewModel.Tracker.afterFlush(() => this.vmChange());
      }) && null}
      </div>;
  }

  constructor(props) {
    super(props);
    ViewModel.prepareComponent("Test", this, {});
  }

}`);
});
