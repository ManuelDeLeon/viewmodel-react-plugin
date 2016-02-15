import {assert} from "chai";
import vmc2jsx from "./index";

describe("vmc2jsx", function() {
  it("returns string plus !", function() {
    var result = vmc2jsx.convert("AA");
    assert.equal(result, "AA!");
  })
});