const {setSql} = require("./utils");

describe("", () => {

  test("setSql", () => {
    const result = setSql(`
    <Parameter name="table"><![CDATA[(
    SELECT * FROM trees
    ) as cdbq]]></Parameter>`, "select * from ddd");
    expect(result).toMatch("ddd");
  });
});
