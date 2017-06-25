const babel = require('babel-core');
const plugin = require('../dist/');
const assert = require('assert');

const example = `
Test({
  render(){
    <div />
  }
});
`;

it('works', () => {
	const { code } = babel.transform(example, { presets: ['es2015', 'react'], plugins: [ plugin] });
	expect(code).toMatchSnapshot();
});