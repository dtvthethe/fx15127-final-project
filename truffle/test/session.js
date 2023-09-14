const Main = artifacts.require("Main");
const Session = artifacts.require("Session");
const { config } = require('../../config');

const MAX_OF_PARTICIPANTS = 4;
let adminAddr = null;

contract('Session', (accounts) => {
    const participantAAddr = accounts[1];
    const participantBAddr = accounts[2];
    const participantCAddr = accounts[3];
    const participantDAddr = accounts[4];

    let MainInstance = null;
    let SessionInstance1 = null;

    before(async () => {
        MainInstance = await Main.new(MAX_OF_PARTICIPANTS);
        await MainInstance.addParticipant(participantAAddr);
        await MainInstance.addParticipant(participantBAddr);
        await MainInstance.addParticipant(participantCAddr);
        await MainInstance.addParticipant(participantDAddr);
        adminAddr = await MainInstance.admin.call();
    });

    describe('Contract Session deploy', () => {
        it("Test Session create", async () => {
            SessionInstance1 = await Session.new(MainInstance.address, 'session A', 'session A description', ['a.png'], adminAddr);
            assert.notEqual(SessionInstance1, undefined, 'Failed to deploy Session1 contract');
        });
    });

    describe('Session info', () => {
        it('Test update Session detail', async () => {
            try {
                await SessionInstance1.updateSession('name update', 'description update', ['update.png']);
                assert.isOk(true, 'Success Update Admin Profile');
            } catch (err) {
                assert.isOk(false, 'Failed Update Admin Profile');
            }
        });

        it('Test get Session detail', async () => {
            const result = await SessionInstance1.getSessionDetail();
            assert.equal(result[0], 'name update', 'Failed get session detail: name');
            assert.equal(result[1], 'description update', 'Failed get session detail: description');
            assert.equal(result[2].length, 1, 'Failed get session detail: image');
            assert.equal(result[2][0], 'update.png', 'Failed get session detail: image');
            assert.equal(result[3].toNumber(), 0, 'Failed get session detail: suggest price');
            assert.equal(result[4].toNumber(), 0, 'Failed get session detail: final price');
            assert.equal(result[5].toNumber(), config.SESSION_STATUS.CREATED, 'Failed get session detail: status');
        });

        it("Test get start Session", async () => {
            await SessionInstance1.startSession();
            const result = await SessionInstance1.getSessionDetail();
            assert.equal(result[5].toNumber(), config.SESSION_STATUS.PRICING, 'Failed start session');
        });
    });

    describe('Pricing', () => {
        it('Test pricing Session', async () => {
            try {
                await SessionInstance1.pricing(10000, {from: participantAAddr});
                await SessionInstance1.pricing(12000, {from: participantBAddr});
                await SessionInstance1.pricing(15000, {from: participantCAddr});
                await SessionInstance1.pricing(10000, {from: participantDAddr});
                assert.isOk(true, 'Success pricing Session');
            } catch (error) {
                assert.isOk(false, 'Failed pricing Session');
            }
        });

        it('Test get Participant pricing', async () => {
            const result = await SessionInstance1.getParticipantPricings();
            assert.equal(result[0], participantAAddr, 'Failed get Participant pricing');
            assert.equal(result[1], participantBAddr, 'Failed get Participant pricing');
            assert.equal(result[2], participantCAddr, 'Failed get Participant pricing');
            assert.equal(result[3], participantDAddr, 'Failed get Participant pricing');
        });

        it('Test get Participant pricing exists', async () => {
            const resultOk = await SessionInstance1.getParticipantPricingExists(participantAAddr);
            assert.isOk(resultOk, 'Failed get Participant pricing exists');

            const resultNot = await SessionInstance1.getParticipantPricingExists('0x0000000000000000000000000000001baC002299');
            assert.isNotOk(resultNot, 'Failed get Participant pricing exists');
        });

        it('Test get all prices', async () => {
            const result = await SessionInstance1.getAllPrices();
            assert.equal(result[0].toNumber(), 10000, 'Failed get all prices');
            assert.equal(result[1].toNumber(), 12000, 'Failed get all prices');
            assert.equal(result[2].toNumber(), 15000, 'Failed get all prices');
            assert.equal(result[3].toNumber(), 10000, 'Failed get all prices');
        });

        it('Test get price by participant', async () => {
            const result = await SessionInstance1.getPricingByParticipant({from: participantBAddr});
            assert.equal(result.toNumber(), 12000, 'Failed get price by participant');
        });

        it('Test stop session', async () => {
            await SessionInstance1.stopSession(11000);
            const result = await SessionInstance1.getSessionDetail();
            assert.equal(result[5].toNumber(), config.SESSION_STATUS.STOP, 'Failed get session detail: status');
        });
    });

    // Refer to file "BDP305x_TestCases.xlsx" sheet "Business Logic Calculate"
    describe('Verify after stop session', () => {
        it('Test get deviation ParticipantA', async () => {
            const result = await MainInstance.getDeviation(participantAAddr);
            assert.equal(result.toNumber(), 9, 'Failed get deviation ParticipantA');
        });

        it('Test get deviation ParticipantB', async () => {
            const result = await MainInstance.getDeviation(participantBAddr);
            assert.equal(result.toNumber(), 9, 'Failed get deviation ParticipantB');
        });

        it('Test get deviation ParticipantC', async () => {
            const result = await MainInstance.getDeviation(participantCAddr);
            assert.equal(result.toNumber(), 36, 'Failed get deviation ParticipantC');
        });

        it('Test get deviation ParticipantD', async () => {
            const result = await MainInstance.getDeviation(participantDAddr);
            assert.equal(result.toNumber(), 9, 'Failed get deviation ParticipantD');
        });

        it('Test get all Participants', async () => {
            const result = await MainInstance.getAllParticipants();
            assert.equal(result[0].numberOfSession, 1, 'Failed get all Participants: numberOfSession A');
            assert.equal(result[0].deviation, 9, 'Failed get all Participants: deviation A');
            assert.equal(result[1].numberOfSession, 1, 'Failed get all Participants: numberOfSession B');
            assert.equal(result[1].deviation, 9, 'Failed get all Participants: deviation B');
            assert.equal(result[2].numberOfSession, 1, 'Failed get all Participants: numberOfSession C');
            assert.equal(result[2].deviation, 36, 'Failed get all Participants: deviation C');
            assert.equal(result[3].numberOfSession, 1, 'Failed get all Participants: numberOfSession D');
            assert.equal(result[3].deviation, 9, 'Failed get all Participants: deviation D');
        });
    });
});
