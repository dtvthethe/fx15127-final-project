// SPDX-License-Identifier: MIT
pragma solidity ^0.4.26;
pragma experimental ABIEncoderV2;
import "./Session.sol";

contract Main is IMain {
    // Structure to hold details of Bidder
    struct IParticipant {
        // TODO
        address account;
        string fullName;
        string email;
        int numberOfSession;
        int deviation;
    }

    // Struct IUser:
    struct IUser {
        address account;
        string fullName;
        string email;
    }

    address public admin;

    // TODO: Variables
    uint private maxOfUser;
    mapping(address => IParticipant) private mapParticipants;
    address[] private participantItems;
    address[] private sessions;
    IUser private adminProfile;

    constructor(uint _maxOfUser) public {
        admin = msg.sender;
        maxOfUser = _maxOfUser;
        adminProfile.account = msg.sender;
    }

    // Add a Session Contract address into Main Contract. Use to link Session with Main
    function addSession(address session) public {
        // TODO
        Session newSession = Session(session);
        sessions.push(address(newSession));
    }

    // TODO: Functions
    // Get admin.
    function getAdmin() public view returns (address) {
        return admin;
    }

    // Update admin profile.
    function updateAdminProfile(string _fullName, string _email) public onlyAdmin {
        adminProfile.fullName = _fullName;
        adminProfile.email = _email;
    }

    // Get admin profile.
    function getAdminProfile() public onlyAdmin view returns(IUser memory) {
        return adminProfile;
    }

    // Add participant.
    function addParticipant(address _account) public onlyAdmin onlyInNumberOfRangeParticipant {
        require(_account != admin, "Can not add admin address to participant list!");
        mapParticipants[_account] = IParticipant(_account, "", "", 0, 0);
        participantItems.push(_account);
        emit AddParticipant(_account, "Add participant success!");
    }

    // Update participant.
    function register(address _account, string memory _fullName, string memory _email) public {
        mapParticipants[_account].fullName = _fullName;
        mapParticipants[_account].email = _email;
        emit UpdateParticipant(_account, _fullName, _email);
    }

    // Get participant by address.
    function participants(address _account) public view returns (IParticipant memory) {
        return mapParticipants[_account];
    }

    // Get all participants.
    function getAllParticipants() public onlyAdmin view returns (IParticipant[] memory) {
        IParticipant[] memory _participants = new IParticipant[](participantItems.length);

        for (uint i = 0; i < participantItems.length; i++) {
            _participants[i] = mapParticipants[participantItems[i]];
        }

        return _participants;
    }

    // Get number of participants.
    function nParticipants() public view returns (uint) {
        return participantItems.length;
    }

    // Get participant by index.
    function iParticipants(uint _index) public view returns (IParticipant memory) {
        return mapParticipants[participantItems[_index]];
    }

    // Create new Session.
    function createSession(string memory _productName, string memory _description, string[] memory _images) public onlyAdmin(){
        new Session(address(this), _productName, _description, _images);
        emit CreateSession(_productName, _description);
    }

    // Get deviation by participant.
    function getDeviation(address _account) external view returns (int) {
        return mapParticipants[_account].deviation;
    }

    // Set deviation.
    function setDeviation(address _account, int _deviation) public onlyAdmin {
        mapParticipants[_account].deviation = _deviation;
    }

    // Set numnber of session.
    function incrementNumberOfSession(address _account) public onlyAdmin {
        mapParticipants[_account].numberOfSession++;
    }

    // Get number of session.
    function getNumberOfSession(address _account) public view onlyAdmin returns(int) {
        return mapParticipants[_account].numberOfSession;
    }

    // Get all session address.
    function getAllSessionAddresses() public view returns (address[] memory) {
        return sessions;
    }

    function getAllSessions() public view returns (address[] memory) {
        return sessions;
    }

    // Get number of session.
    function nSessions() public view returns (uint) {
        return sessions.length;
    }

    // Get session detail.
    function getSessionDetail(address _session) public view returns (string memory, string memory, string[] memory, uint, int, uint) {
        Session session = Session(_session);

        return session.getSessionDetail();
    }

    // Modify only admin.
    modifier onlyAdmin() {
        require(msg.sender == admin, "This function only admin can execute!");
        _;
    }

    // Modify number of participant in ragne.
    modifier onlyInNumberOfRangeParticipant() {
        require(participantItems.length < maxOfUser, "Only create 10 users!");
        _;
    }

    // Event update participant.
    event UpdateParticipant(address _account, string _fullName, string _email);

    // Event add participant.
    event AddParticipant(address _account, string msg);

    // Event create session.
    event CreateSession(string _productName, string _description);
}
