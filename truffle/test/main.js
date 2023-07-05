const Main = artifacts.require("Main");
const Session = artifacts.require("Session");
const { config } = require('../../config');

contract("Main", (accounts) => {
    let instance;
    const MAX_OF_PARTICIPANTS = 4;

    // before(async () => {
    //     instance = await Main.new(MAX_OF_PARTICIPANTS);
    // });

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

        let MainInstance = null;
        let SessionInstance1 = null;
        let SessionInstance2 = null;
        let SessionInstance3 = null;
        let SessionInstance4 = null;

        it('Test main contract deployed', async () => {
            MainInstance = await Main.deployed();
            assert.notEqual(MainInstance, undefined, 'Failed to deploy Main contract');
        });

        it('Test session contract deployed', async () => {
            // module.exports = function (deployer) {
            //     deployer.deploy(Session, MainInstance.address, 'session A', 'session A description', ['a.png']);
            // }
            SessionInstance1 = await Session.new(MainInstance.address, 'session A', 'session A description', ['a.png']);
            SessionInstance2 = await Session.new(MainInstance.address, 'session B', 'session B description', ['b.png']);
            SessionInstance3 = await Session.new(MainInstance.address, 'session C', 'session C description', ['c.png']);
            SessionInstance4 = await Session.new(MainInstance.address, 'session D', 'session D description', ['d.png']);
            assert.notEqual(SessionInstance1, undefined, 'Failed to deploy Session1 contract');
            assert.notEqual(SessionInstance2, undefined, 'Failed to deploy Session2 contract');
            assert.notEqual(SessionInstance3, undefined, 'Failed to deploy Session3 contract');
            assert.notEqual(SessionInstance4, undefined, 'Failed to deploy Session4 contract');
        });

        it('Test n session', async () => {
            const nSessions = await MainInstance.nSessions();
            assert.equal(nSessions.toNumber(), 4, 'Failed to create session');
        });

        it('Test add participant', async () => {
            await MainInstance.addParticipant(participantAAddr);
            await MainInstance.addParticipant(participantBAddr);
            await MainInstance.addParticipant(participantCAddr);
            await MainInstance.addParticipant(participantDAddr);
        });

        it('Test n participant', async () => {
            const nParticipants = await MainInstance.nParticipants();
            assert.equal(nParticipants.toNumber(), 4, 'Failed to create participant');
        });


        it('Test start session', async () => {
            await SessionInstance1.startSession();
            await SessionInstance2.startSession();
            await SessionInstance3.startSession();
            await SessionInstance4.startSession();
        });

        it('Test get detail session', async () => {
            const getSessionDetail = await SessionInstance1.getSessionDetail();
            assert.equal(getSessionDetail[0], 'session A', 'Get detail session.name failed');
            assert.equal(getSessionDetail[1], 'session A description', 'Get detail session.description failed');
            assert.equal(getSessionDetail[2], 'a.png', 'Get detail session.image failed');
            assert.equal(getSessionDetail[3].toNumber(), 0, 'Get detail session.suggestPrice failed');
            assert.equal(getSessionDetail[4].toNumber(), 0, 'Get detail session.finalPrice failed');
            assert.equal(getSessionDetail[5].toNumber(), config.SESSION_STATUS.PRICING, 'Get detail session.status failed');
        });

        it('Test pricing session A', async () => {
            const parAPricingSessionA = await SessionInstance1.pricing(10000, {from: participantAAddr});
            assert.notEqual(parAPricingSessionA, undefined, 'Pricing session A failed.');
            const parBPricingSessionA = await SessionInstance1.pricing(12000, {from: participantBAddr});
            assert.notEqual(parBPricingSessionA, undefined, 'Pricing session B failed.');
            const parCPricingSessionA = await SessionInstance1.pricing(15000, {from: participantCAddr});
            assert.notEqual(parCPricingSessionA, undefined, 'Pricing session C failed.');
            const parDPricingSessionA = await SessionInstance1.pricing(10000, {from: participantDAddr});
            assert.notEqual(parDPricingSessionA, undefined, 'Pricing session D failed.');
        });

        it('Test calculate suggest price session A', async () => {
            await SessionInstance1.calculateSuggestPriceAndCloseSession(11000);
            const getSessionDetail = await SessionInstance1.getSessionDetail();
            assert.equal(getSessionDetail[0], 'session A', 'Get detail session.name failed');
            assert.equal(getSessionDetail[1], 'session A description', 'Get detail session.description failed');
            assert.equal(getSessionDetail[2], 'a.png', 'Get detail session.image failed');
            assert.equal(getSessionDetail[3].toNumber(), 11750, 'Get detail session.suggestPrice failed');
            assert.equal(getSessionDetail[4].toNumber(), 11000, 'Get detail session.finalPrice failed');
            assert.equal(getSessionDetail[5].toNumber(), config.SESSION_STATUS.CLOSE, 'Get detail session.status failed');
        });

        it('Test calculate deviation each participant by session A', async () => {
            await SessionInstance1.calculateDeviationLatestAndStop();

            const participantA = await MainInstance.iParticipants(0);
            assert.equal(participantA.numberOfSession, 1, 'Get detail participantA.numberOfSession failed');
            assert.equal(participantA.deviation, 9, 'Get detail participantA.deviation failed');

            const participantB = await MainInstance.iParticipants(1);
            assert.equal(participantB.numberOfSession, 1, 'Get detail participantB.numberOfSession failed');
            assert.equal(participantB.deviation, 9, 'Get detail participantB.deviation failed');

            const participantC = await MainInstance.iParticipants(2);
            assert.equal(participantC.numberOfSession, 1, 'Get detail participantC.numberOfSession failed');
            assert.equal(participantC.deviation, 36, 'Get detail participantC.deviation failed');

            const participantD = await MainInstance.iParticipants(3);
            assert.equal(participantD.numberOfSession, 1, 'Get detail participantD.numberOfSession failed');
            assert.equal(participantD.deviation, 9, 'Get detail participantD.deviation failed');
        });

        it('Test pricing session B', async () => {
            const parAPricingSessionB = await SessionInstance2.pricing(20000, {from: participantAAddr});
            assert.notEqual(parAPricingSessionB, undefined, 'Pricing session A failed.');
            const parBPricingSessionB = await SessionInstance2.pricing(22000, {from: participantBAddr});
            assert.notEqual(parBPricingSessionB, undefined, 'Pricing session B failed.');
        });

        it('Test calculate suggest price session B', async () => {
            await SessionInstance2.calculateSuggestPriceAndCloseSession(23000);
            const getSessionDetail = await SessionInstance2.getSessionDetail();
            assert.equal(getSessionDetail[0], 'session B', 'Get detail session.name failed');
            assert.equal(getSessionDetail[1], 'session B description', 'Get detail session.description failed');
            assert.equal(getSessionDetail[2], 'b.png', 'Get detail session.image failed');
            assert.equal(getSessionDetail[3].toNumber(), 21000, 'Get detail session.suggestPrice failed');
            assert.equal(getSessionDetail[4].toNumber(), 23000, 'Get detail session.finalPrice failed');
            assert.equal(getSessionDetail[5].toNumber(), config.SESSION_STATUS.CLOSE, 'Get detail session.status failed');
        });

        it('Test calculate deviation each participant by session B', async () => {
            await SessionInstance2.calculateDeviationLatestAndStop();

            const participantA = await MainInstance.iParticipants(0);
            assert.equal(participantA.numberOfSession, 2, 'Get detail participantA.numberOfSession failed');
            assert.equal(participantA.deviation, 11, 'Get detail participantA.deviation failed');

            const participantB = await MainInstance.iParticipants(1);
            assert.equal(participantB.numberOfSession, 2, 'Get detail participantB.numberOfSession failed');
            assert.equal(participantB.deviation, 6, 'Get detail participantB.deviation failed');

            const participantC = await MainInstance.iParticipants(2);
            assert.equal(participantC.numberOfSession, 1, 'Get detail participantC.numberOfSession failed');
            assert.equal(participantC.deviation, 36, 'Get detail participantC.deviation failed');

            const participantD = await MainInstance.iParticipants(3);
            assert.equal(participantD.numberOfSession, 1, 'Get detail participantD.numberOfSession failed');
            assert.equal(participantD.deviation, 9, 'Get detail participantD.deviation failed');
        });

        it('Test pricing session C', async () => {
            const parAPricingSessionC = await SessionInstance3.pricing(15000, {from: participantAAddr});
            assert.notEqual(parAPricingSessionC, undefined, 'Pricing session A failed.');
            const parBPricingSessionC = await SessionInstance3.pricing(17000, {from: participantBAddr});
            assert.notEqual(parBPricingSessionC, undefined, 'Pricing session B failed.');
            const parDPricingSessionC = await SessionInstance3.pricing(12000, {from: participantDAddr});
            assert.notEqual(parDPricingSessionC, undefined, 'Pricing session D failed.');
        });

        it('Test calculate suggest price session C', async () => {
            await SessionInstance3.calculateSuggestPriceAndCloseSession(15000);
            const getSessionDetail = await SessionInstance3.getSessionDetail();
            assert.equal(getSessionDetail[0], 'session C', 'Get detail session.name failed');
            assert.equal(getSessionDetail[1], 'session C description', 'Get detail session.description failed');
            assert.equal(getSessionDetail[2], 'c.png', 'Get detail session.image failed');
            assert.equal(getSessionDetail[3].toNumber(), 14689, 'Get detail session.suggestPrice failed');
            assert.equal(getSessionDetail[4].toNumber(), 15000, 'Get detail session.finalPrice failed');
            assert.equal(getSessionDetail[5].toNumber(), config.SESSION_STATUS.CLOSE, 'Get detail session.status failed');
        });

        it('Test calculate deviation each participant by session C', async () => {
            await SessionInstance3.calculateDeviationLatestAndStop();

            const participantA = await MainInstance.iParticipants(0);
            assert.equal(participantA.numberOfSession, 3, 'Get detail participantA.numberOfSession failed');
            assert.equal(participantA.deviation, 7, 'Get detail participantA.deviation failed');

            const participantB = await MainInstance.iParticipants(1);
            assert.equal(participantB.numberOfSession, 3, 'Get detail participantB.numberOfSession failed');
            assert.equal(participantB.deviation, 8, 'Get detail participantB.deviation failed');

            const participantC = await MainInstance.iParticipants(2);
            assert.equal(participantC.numberOfSession, 1, 'Get detail participantC.numberOfSession failed');
            assert.equal(participantC.deviation, 36, 'Get detail participantC.deviation failed');

            const participantD = await MainInstance.iParticipants(3);
            assert.equal(participantD.numberOfSession, 2, 'Get detail participantD.numberOfSession failed');
            assert.equal(participantD.deviation, 14, 'Get detail participantD.deviation failed');
        });

        it('Test pricing session D', async () => {
            const parAPricingSessionD = await SessionInstance4.pricing(56000, {from: participantAAddr});
            assert.notEqual(parAPricingSessionD, undefined, 'Pricing session A failed.');
            const parBPricingSessionD = await SessionInstance4.pricing(40000, {from: participantBAddr});
            assert.notEqual(parBPricingSessionD, undefined, 'Pricing session B failed.');
            const parCPricingSessionD = await SessionInstance4.pricing(42000, {from: participantCAddr});
            assert.notEqual(parCPricingSessionD, undefined, 'Pricing session C failed.');
            const parDPricingSessionD = await SessionInstance4.pricing(41000, {from: participantDAddr});
            assert.notEqual(parDPricingSessionD, undefined, 'Pricing session D failed.');
      
        });

        it('Test calculate suggest price session D', async () => {
            await SessionInstance4.calculateSuggestPriceAndCloseSession(45000);
            const getSessionDetail = await SessionInstance4.getSessionDetail();
            assert.equal(getSessionDetail[0], 'session D', 'Get detail session.name failed');
            assert.equal(getSessionDetail[1], 'session D description', 'Get detail session.description failed');
            assert.equal(getSessionDetail[2], 'd.png', 'Get detail session.image failed');
            assert.equal(getSessionDetail[3].toNumber(), 45080, 'Get detail session.suggestPrice failed');
            assert.equal(getSessionDetail[4].toNumber(), 45000, 'Get detail session.finalPrice failed');
            assert.equal(getSessionDetail[5].toNumber(), config.SESSION_STATUS.CLOSE, 'Get detail session.status failed');
        });

        it('Test calculate deviation each participant by session D', async () => {
            await SessionInstance4.calculateDeviationLatestAndStop();

            const participantA = await MainInstance.iParticipants(0);
            assert.equal(participantA.numberOfSession, 4, 'Get detail participantA.numberOfSession failed');
            assert.equal(participantA.deviation, 11, 'Get detail participantA.deviation failed');

            const participantB = await MainInstance.iParticipants(1);
            assert.equal(participantB.numberOfSession, 4, 'Get detail participantB.numberOfSession failed');
            assert.equal(participantB.deviation, 8, 'Get detail participantB.deviation failed');

            const participantC = await MainInstance.iParticipants(2);
            assert.equal(participantC.numberOfSession, 2, 'Get detail participantC.numberOfSession failed');
            assert.equal(participantC.deviation, 21, 'Get detail participantC.deviation failed');

            const participantD = await MainInstance.iParticipants(3);
            assert.equal(participantD.numberOfSession, 3, 'Get detail participantD.numberOfSession failed');
            assert.equal(participantD.deviation, 12, 'Get detail participantD.deviation failed');
        });
    });
});
