const Main = artifacts.require("Main");
const Session = artifacts.require("Session");
const { config } = require('../../config');

const MAX_OF_PARTICIPANTS = 4;

const getMsgEvent = (response) => {
    return response.logs[0].args;
}

contract('Main', (accounts) => {
    const participantAAddr = accounts[1];
    const participantBAddr = accounts[2];
    const participantCAddr = accounts[3];
    const participantDAddr = accounts[4];

    let MainInstance = null;
    let SessionInstance1 = null;
    let SessionInstance2 = null;
    let SessionInstance3 = null;
    let SessionInstance4 = null;

    before(async () => {
        MainInstance = await Main.new(MAX_OF_PARTICIPANTS);
    });

    describe('Contract Main deploy', () => {
        it("Test Main should deployed", () => {
            assert.notEqual(MainInstance, undefined, 'Failed to deploy Main contract');
        });
    });

    describe('Admin account', () => {
        it('Test get admin address', async () => {
            const adminAddr = await MainInstance.getAdmin();
            assert.equal(adminAddr, accounts[0], 'Failed Get Admin Address');
        });

        it('Test update admin profile', async () => {
            try {
                await MainInstance.updateAdminProfile('Admin', 'ad@mail.com');
                assert.isOk(true, 'Success Update Admin Profile');
            } catch (err) {
                assert.isOk(false, 'Failed Update Admin Profile');
            }
        });

        it('Test get admin profile', async () => {
            const adminProfile = await MainInstance.getAdminProfile();
            assert.equal(adminProfile.account, accounts[0], 'Failed Get Admin Profile');
            assert.equal(adminProfile.fullName, 'Admin', 'Failed Get Admin Fullname');
            assert.equal(adminProfile.email, 'ad@mail.com', 'Failed Get Admin Email');
        });
 
    });

    describe('Participant', () => {
        it('Test add Participant', async () => {
            const result = await MainInstance.addParticipant(participantAAddr);
            assert.equal(getMsgEvent(result).msg, 'Add participant success!', 'Failed add Participant');
        });

        it('Test Participant update profile', async () => {
            const result = await MainInstance.register(participantAAddr, 'User1', 'user1@mail.com');
            const responseArg = getMsgEvent(result);
            assert.equal(responseArg._account, participantAAddr, 'Failed Participant update profile: account');
            assert.equal(responseArg._fullName, 'User1', 'Failed Participant update profile: full name');
            assert.equal(responseArg._email, 'user1@mail.com', 'Failed Participant update profile: email');
        });

        it('Test get Participant by address', async () => {
            const result = await MainInstance.participants(participantAAddr);
            assert.equal(result.account, participantAAddr, 'Failed get Participant: account');
            assert.equal(result.fullName, 'User1', 'Failed get Participant: full name');
            assert.equal(result.email, 'user1@mail.com', 'Failed get Participant: email');
            assert.equal(result.numberOfSession, 0, 'Failed get Participant: number of session');
            assert.equal(result.deviation, 0, 'Failed get Participant: deviation');
        });

        it('Test all participants', async () => {
            const result = await MainInstance.getAllParticipants();
            assert.equal(result.length, 1, 'Failed get all participants');
        });

        it('Test number of participants', async () => {
            const result = await MainInstance.nParticipants();
            assert.equal(result, 1, 'Failed get number of participants');
        });

        it('Test get Participant by index', async () => {
            const result = await MainInstance.iParticipants(0);
            assert.equal(result.account, participantAAddr, 'Failed get Participant by index: account');
            assert.equal(result.fullName, 'User1', 'Failed get Participant by index: full name');
            assert.equal(result.email, 'user1@mail.com', 'Failed get Participant by index: email');
            assert.equal(result.numberOfSession, 0, 'Failed get Participant by index: number of session');
            assert.equal(result.deviation, 0, 'Failed get Participant by index: deviation');
        });
    });

    describe('Session', () => {
        let testSessionAddress = null;
        it('Test create session', async () => {
            const result = await MainInstance.createSession('test name product', 'test description product', ['test.png']);
            const responseArg = getMsgEvent(result);
            assert.equal(responseArg._productName, 'test name product', 'Failed create session: name');
            assert.equal(responseArg._description, 'test description product', 'Failed create session: description');
        });

        it('Test get all session address', async () => {
            const result = await MainInstance.getAllSessionAddresses();
            testSessionAddress = result[0];
            assert.equal(result.length, 1, 'Failed get all session address');
        });

        it('Test get number of session', async () => {
            const result = await MainInstance.nSessions();
            assert.equal(result, 1, 'Failed get number of session');
        });

        it('Test get session detail', async () => {
            const result = await MainInstance.getSessionDetail(testSessionAddress);
            assert.equal(result[0], 'test name product', 'Failed get session detail: name');
            assert.equal(result[1], 'test description product', 'Failed get session detail: description');
            assert.equal(result[2].length, 1, 'Failed get session detail: image');
            assert.equal(result[2][0], 'test.png', 'Failed get session detail: image');
            assert.equal(result[3].toNumber(), 0, 'Failed get session detail: suggest price');
            assert.equal(result[4].toNumber(), 0, 'Failed get session detail: final price');
            assert.equal(result[5].toNumber(), config.SESSION_STATUS.CREATED, 'Failed get session detail: status');
        });
    });

    // Refer to file "BDP305x_TestCases.xlsx" sheet "Business Logic Calculate"
    describe("Business Logic Calculate", () => {
        it('Test Session create', async () => {
            SessionInstance1 = await Session.new(MainInstance.address, 'session A', 'session A description', ['a.png']);
            SessionInstance2 = await Session.new(MainInstance.address, 'session B', 'session B description', ['b.png']);
            SessionInstance3 = await Session.new(MainInstance.address, 'session C', 'session C description', ['c.png']);
            SessionInstance4 = await Session.new(MainInstance.address, 'session D', 'session D description', ['d.png']);
            assert.notEqual(SessionInstance1, undefined, 'Failed to deploy Session1 contract');
            assert.notEqual(SessionInstance2, undefined, 'Failed to deploy Session2 contract');
            assert.notEqual(SessionInstance3, undefined, 'Failed to deploy Session3 contract');
            assert.notEqual(SessionInstance4, undefined, 'Failed to deploy Session4 contract');

        });

        it('Test n Session', async () => {
            const nSessions = await MainInstance.nSessions();
            assert.equal(nSessions.toNumber(), 5, 'Failed to create session');
        });

        it('Test add Participant', async () => {
            // await MainInstance.addParticipant(participantAAddr);
            await MainInstance.addParticipant(participantBAddr);
            await MainInstance.addParticipant(participantCAddr);
            await MainInstance.addParticipant(participantDAddr);
        });

        it('Test n Participant', async () => {
            const nParticipants = await MainInstance.nParticipants();
            assert.equal(nParticipants.toNumber(), 4, 'Failed to create participant');
        });

        it('Test start session', async () => {
            await SessionInstance1.startSession();
            await SessionInstance2.startSession();
            await SessionInstance3.startSession();
            await SessionInstance4.startSession();
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

        it('Test stop session A', async () => {
            await SessionInstance1.stopSession(11000);

            const getSessionDetail = await SessionInstance1.getSessionDetail();
            assert.equal(getSessionDetail[0], 'session A', 'Get detail session.name failed');
            assert.equal(getSessionDetail[1], 'session A description', 'Get detail session.description failed');
            assert.equal(getSessionDetail[2], 'a.png', 'Get detail session.image failed');
            assert.equal(getSessionDetail[3].toNumber(), 11750, 'Get detail session.suggestPrice failed');
            assert.equal(getSessionDetail[4].toNumber(), 11000, 'Get detail session.finalPrice failed');
            assert.equal(getSessionDetail[5].toNumber(), config.SESSION_STATUS.STOP, 'Get detail session.status failed');

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

        it('Test stop session B', async () => {
            await SessionInstance2.stopSession(23000);

            const getSessionDetail = await SessionInstance2.getSessionDetail();
            assert.equal(getSessionDetail[0], 'session B', 'Get detail session.name failed');
            assert.equal(getSessionDetail[1], 'session B description', 'Get detail session.description failed');
            assert.equal(getSessionDetail[2], 'b.png', 'Get detail session.image failed');
            assert.equal(getSessionDetail[3].toNumber(), 21000, 'Get detail session.suggestPrice failed');
            assert.equal(getSessionDetail[4].toNumber(), 23000, 'Get detail session.finalPrice failed');
            assert.equal(getSessionDetail[5].toNumber(), config.SESSION_STATUS.STOP, 'Get detail session.status failed');

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

        it('Test stop session C', async () => {
            await SessionInstance3.stopSession(15000);

            const getSessionDetail = await SessionInstance3.getSessionDetail();
            assert.equal(getSessionDetail[0], 'session C', 'Get detail session.name failed');
            assert.equal(getSessionDetail[1], 'session C description', 'Get detail session.description failed');
            assert.equal(getSessionDetail[2], 'c.png', 'Get detail session.image failed');
            assert.equal(getSessionDetail[3].toNumber(), 14689, 'Get detail session.suggestPrice failed');
            assert.equal(getSessionDetail[4].toNumber(), 15000, 'Get detail session.finalPrice failed');
            assert.equal(getSessionDetail[5].toNumber(), config.SESSION_STATUS.STOP, 'Get detail session.status failed');

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

        it('Test stop session D', async () => {
            await SessionInstance4.stopSession(45000);

            const getSessionDetail = await SessionInstance4.getSessionDetail();
            assert.equal(getSessionDetail[0], 'session D', 'Get detail session.name failed');
            assert.equal(getSessionDetail[1], 'session D description', 'Get detail session.description failed');
            assert.equal(getSessionDetail[2], 'd.png', 'Get detail session.image failed');
            assert.equal(getSessionDetail[3].toNumber(), 45080, 'Get detail session.suggestPrice failed');
            assert.equal(getSessionDetail[4].toNumber(), 45000, 'Get detail session.finalPrice failed');
            assert.equal(getSessionDetail[5].toNumber(), config.SESSION_STATUS.STOP, 'Get detail session.status failed');

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
