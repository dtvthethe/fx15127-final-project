// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./Session.sol";

contract Main is IMain {

    // Structure to hold details of Bidder
    struct IParticipant {
        // TODO
        address account;
        string fullName;
        string email;
        uint256 numberOfSession;
        uint8 deviation;
    }

    address public admin;

    // TODO: Variables
    uint8 private maxOfUser;
    mapping(address => IParticipant) private mapParticipants;
    address[] private participants;
    address[] private sessions;

    constructor(uint8 _maxOfUser) {
        admin = msg.sender;
        maxOfUser = _maxOfUser;
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

    // Add participant.
    function addParticipant(address _account) public onlyAdmin onlyInNumberOfRangeParticipant {
        mapParticipants[_account] = IParticipant(_account, "", "", 0, 0);
        participants.push(_account);
        emit AddParticipant(_account, "Add participant success!");
    }

    // Update participant.
    function updateParticipant(address _account, string memory _fullName, string memory _email) public {
        mapParticipants[_account].fullName = _fullName;
        mapParticipants[_account].email = _email;
        emit UpdateParticipant(_account, _fullName, _email);
    }

    // Get participant by address.
    function getParticipant(address _account) public view returns (IParticipant memory) {
        return mapParticipants[_account];
    }

    // Get all participants.
    function getAllParticipants() public onlyAdmin view returns (IParticipant[] memory) {
        IParticipant[] memory _participants = new IParticipant[](participants.length);

        for (uint8 i = 0; i < participants.length; i++) {
            _participants[i] = mapParticipants[participants[i]];
        }

        return _participants;
    }

    // Create new Session.
    function createSession(string memory _productName, string memory _description, string[] memory _images) public onlyAdmin(){
        new Session(address(this), _productName, _description, _images);
        emit CreateSession(_productName, _description);
    }

    // Get all Session address.
    function getAllSessionAddresses() public view returns (address[] memory) {
        return sessions;
    }

    function getAllSessions() public view returns (address[] memory) {
        return sessions;
    }

    // Get session detail.
    function getSessionDetail(address _session) public view returns (string memory, string memory, string[] memory, uint256, uint256, uint8) {
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
        require(participants.length < maxOfUser, "Only create 10 users!");
        _;
    }

    // Event update participant.
    event UpdateParticipant(address _account, string _fullName, string _email);

    // Event add participant.
    event AddParticipant(address _account, string msg);

    // Event create session.
    event CreateSession(string _productName, string _description);
}
