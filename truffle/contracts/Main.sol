// SPDX-License-Identifier: MIT
pragma solidity ^0.4.26;
pragma experimental ABIEncoderV2;
import "./Session.sol";

contract Main is IMain {
    /**
     * IParticipant
     * Structure to hold details of Bidder
     */
    struct IParticipant {
        address account;
        string fullName;
        string email;
        int numberOfSession;
        int deviation;
    }

    /**
     * IUser
     * Structure to define user
     */
    struct IUser {
        address account;
        string fullName;
        string email;
    }

    /**
     * Admin address.
     */
    address public admin;

    /**
     * Max of Participant.
     */
    uint private maxOfParticipant;

    /**
     * List of participants mapping between address and struct IParticipant.
     */
    mapping(address => IParticipant) private mapParticipants;

    /**
     * Array of participants address.
     */
    address[] private participantItems;

    /**
     * Array of session address.
     */
    address[] private sessions;

    /**
     * Admin profile.
     */
    IUser private adminProfile;

    /**
     * Main constructor.
     *
     * @param _maxOfParticipant max of participants
     */
    constructor(uint _maxOfParticipant) public {
        admin = msg.sender;
        maxOfParticipant = _maxOfParticipant;
        adminProfile.account = msg.sender;
    }

    /**
     * Event update participant.
     */
    event UpdateParticipant(address _account, string _fullName, string _email);

    /**
     * Event add participant.
     */
    event AddParticipant(address _account, string msg);

    /**
     * Event create session.
     */
    event CreateSession(string _productName, string _description);

    /**
     * Add a Session Contract address into Main Contract. Use to link Session with Main.
     *
     * @param session Session address
     */
    function addSession(address session) public {
        Session newSession = Session(session);
        sessions.push(address(newSession));
    }

    /**
     * Update admin profile.
     * 
     * @param _fullName Full name
     * @param _email email
     */
    function updateAdminProfile(string _fullName, string _email) public onlyAdmin {
        adminProfile.fullName = _fullName;
        adminProfile.email = _email;
    }

    /**
     * Get admin profile.
     *
     * @return IUser
     */
    function getAdminProfile() public onlyAdmin view returns(IUser memory) {
        return adminProfile;
    }

    /**
     * Add participant
     *
     * @param _account participant address
     */
    function addParticipant(address _account) public onlyAdmin onlyInNumberOfRangeParticipant {
        require(_account != admin, "Can not add admin address to participant list!");
        mapParticipants[_account] = IParticipant(_account, "", "", 0, 0);
        participantItems.push(_account);
        emit AddParticipant(_account, "Add participant success!");
    }

    /**
     * Update participant profile.
     *
     * @param _account participant addess
     * @param _fullName full name
     * @param _email email
     */
    function register(address _account, string memory _fullName, string memory _email) public {
        mapParticipants[_account].fullName = _fullName;
        mapParticipants[_account].email = _email;
        emit UpdateParticipant(_account, _fullName, _email);
    }

    /**
     * Get participant by address.
     *
     * @param _account participant addess
     */
    function participants(address _account) public view returns (IParticipant memory) {
        return mapParticipants[_account];
    }

    /**
     * Get all participants.
     *
     * @return IParticipant[] list of participants
     */
    function getAllParticipants() public onlyAdmin view returns (IParticipant[] memory) {
        IParticipant[] memory _participants = new IParticipant[](participantItems.length);

        for (uint i = 0; i < participantItems.length; i++) {
            _participants[i] = mapParticipants[participantItems[i]];
        }

        return _participants;
    }

    /**
     * Get number of participants.
     *
     * @return uint number of participants
     */
    function nParticipants() public view returns (uint) {
        return participantItems.length;
    }

    /**
     * Get participant by index.
     *
     * @param _index index of participants
     *
     * @return IParticipant particiapnt
     */
    function iParticipants(uint _index) public view returns (IParticipant memory) {
        return mapParticipants[participantItems[_index]];
    }

    /**
     * Get deviation by participant address.
     *
     * @param _account participant address
     *
     * @return int deviation
     */
    function getDeviation(address _account) public view returns (int) {
        return mapParticipants[_account].deviation;
    }

    /**
     * Set deviation for a participant.
     *
     * @param _session session address 
     * @param _account participant address
     * @param _deviation deviation vslue 
     */
    function setDeviation(address _session, address _account, int _deviation) public onlySessionContract(_session, _account) {
        mapParticipants[_account].deviation = _deviation;
    }

    /**
     * Increment numnber of session for a participant.
     *
     * @param _account participant address
     */
    function incrementNumberOfSession(address _account) public {
        mapParticipants[_account].numberOfSession++;
    }

    /**
     * Get number of session by participant.
     *
     * @param _account participant address
     *
     * @return int number of session
     */
    function getNumberOfSession(address _account) public view returns (int) {
        return mapParticipants[_account].numberOfSession;
    }

    /**
     * Create new Session.
     *
     * @param _productName session name
     * @param _description session description
     * @param _images Array of images
     */
    function createSession(string memory _productName, string memory _description, string[] memory _images) public onlyAdmin(){
        new Session(address(this), _productName, _description, _images, admin);
        emit CreateSession(_productName, _description);
    }

    /**
     * Get all session address.
     *
     * @return address[] List of all session
     */
    function getAllSessionAddresses() public view returns (address[] memory) {
        return sessions;
    }

    /**
     * Get number of session.
     *
     * @return uint Number of session
     */
    function nSessions() public view returns (uint) {
        return sessions.length;
    }

    /**
     * Get session detail.
     *
     * @param _session session address
     *
     * @return string session name
     * @return string session description
     * @return string[] Array of product images
     * @return uint suggest price
     * @return int final price
     * @return uint status
     */
    function getSessionDetail(address _session) public view returns (string memory, string memory, string[] memory, uint, int, uint) {
        Session session = Session(_session);

        return session.getSessionDetail();
    }

    /**
     * Modify only admin
     * This modify only the Administrator can excute
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "This function only admin can execute!");
        _;
    }

    /**
     * Modify number of participant in ragne.
     */
    modifier onlyInNumberOfRangeParticipant() {
        require(participantItems.length < maxOfParticipant, "Number of user out of range maximun allow!");
        _;
    }

    /**
     * Only session contract
     *
     * @param _session Session address
     * @param _participant Participant address
     */
    modifier onlySessionContract(address _session, address _participant) {
        Session session = Session(_session);
        require(session.getParticipantPricingExists(_participant) == true, "Only session contract!");
        _;
    }
}
