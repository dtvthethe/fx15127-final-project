const Main = artifacts.require("Main");

contract("Main", (accounts) => {
    let instance;

    before(async () => {
        instance = await Main.new(2);
    });

    describe("Contract", () => {
        it("should deployed", () => {
            assert.isTrue(instance !== undefined);
        });
    });
});
