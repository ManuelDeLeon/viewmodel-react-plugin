var assert = require("chai").assert;
var vmc2jsx = require("./index");

describe("vmc2jsx", function() {
  it("returns string plus !", function() {
    var result = vmc2jsx.convert("AA");
    assert.equal(result, "AA!!");
  })
});