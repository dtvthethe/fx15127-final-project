const Web3 = require('web3');
const Main = artifacts.require("Main");
const Session = artifacts.require("Session");

contract("Main", (accounts) => {
    let instance;
    const MAX_OF_PARTICIPANTS = 4;

    before(async () => {
        instance = await Main.new(MAX_OF_PARTICIPANTS);
    });

    // describe("Contract", () => {
    //     it("should deployed", () => {
    //         assert.isTrue(instance !== undefined);
    //     });
    // });

    describe("Main", () => {
        const adminAddr = accounts[0];
        const participantAAddr = accounts[1];
        const participantBAddr = accounts[2];
        const participantCAddr = accounts[3];
        const participantDAddr = accounts[4];
        const web3js = new Web3(web3.currentProvider);


        it("should calculateDeviationLatestAndStop", async () => {
            const participantA = await instance.addParticipant(participantAAddr, {from: adminAddr});
            const participantB = await instance.addParticipant(participantBAddr, {from: adminAddr});
            const participantC = await instance.addParticipant(participantCAddr, {from: adminAddr});
            const participantD = await instance.addParticipant(participantDAddr, {from: adminAddr});

            const sessionAAddr = await instance.createSession('session A', 'session A description', ['a.png'], {from: adminAddr});
            const sessionBAddr = await instance.createSession('session B', 'session B description', ['b.png'], {from: adminAddr});
            const sessionCAddr = await instance.createSession('session C', 'session C description', ['c.png'], {from: adminAddr});
            const sessionDAddr = await instance.createSession('session D', 'session D description', ['d.png'], {from: adminAddr});

            const sessionA = new web3js.eth.Contract(Session.abi, sessionAAddr.logs[0].address);
            // const sessionB = new web3js.eth.Contract(Session.abi, sessionBAddr);
            // const sessionC = new web3js.eth.Contract(Session.abi, sessionCAddr);
            // const sessionD = new web3js.eth.Contract(Session.abi, sessionDAddr);


            // await sessionA.methods.startSession().send({from: adminAddr});
//             await sessionB.methods.startSession({from: adminAddr});
//             await sessionC.methods.startSession({from: adminAddr});
//             await sessionD.methods.startSession({from: adminAddr});

            // const participants = await instance.getAllSessionAddresses();





        });
    });
});
