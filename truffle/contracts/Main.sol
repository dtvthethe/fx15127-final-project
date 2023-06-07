// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./Session.sol";
import "./modal/IParticipant.sol";

contract Main is IMain {
    address public admin;

    // TODO: Variables
    uint8 private numberOfUser;
    address[] public sessions;
    mapping(address => IParticipant) public participants;
    mapping(uint256 => address) private mapParticipants;
    uint8 private numberOfParticipant;
    uint8 private numberOfSession;

    constructor(uint8 _numberOfUser) {
        admin = msg.sender;
        numberOfParticipant = 0;
        numberOfSession = 0;
        numberOfUser = _numberOfUser;
    }

    // Add a Session Contract address into Main Contract. Use to link Session with Main
    function addSession(address session) public onlyAdmin {
        // TODO
        Session newSession = Session(session);
        sessions.push(address(newSession));
        numberOfSession++;
    }

    // TODO: Functions
    // Add participant.
    function addParticipant(address _account) public onlyAdmin onlyInNumberOfRangeParticipant {
        participants[_account] = IParticipant(_account, "", "", 0, 0);
        mapParticipants[numberOfParticipant] = _account;
        numberOfParticipant++;
        emit AddParticipant(_account, "Add participant success!");
    }

    // Update participant.
    function updateParticipant(address _account, string memory _fullName, string memory _email) public {
        participants[_account].fullName = _fullName;
        participants[_account].email = _email;
        emit UpdateParticipant(_account, _fullName, _email);
    }

    // Get participant by address.
    function getParticipant(address _account) public view returns (IParticipant memory) {
        return participants[_account];
    }

    // Get all participants.
    function getAllParticipants() public view returns (IParticipant[] memory) {
        IParticipant[] memory _participants = new IParticipant[](numberOfParticipant);

        for (uint8 i = 0; i < numberOfParticipant; i++) {
            _participants[i] = participants[mapParticipants[i]];
        }

        return _participants;
    }

    // Modify only admin.
    modifier onlyAdmin() {
        require(msg.sender == admin, "This function only admin can execute!");
        _;
    }

    // Modify number of participant in ragne.
    modifier onlyInNumberOfRangeParticipant() {
        require(numberOfParticipant < numberOfUser, "Only create 10 users!");
        _;
    }

    // Event update participant
    event UpdateParticipant(address _account, string _fullName, string _email);

    // Event add participant
    event AddParticipant(address _account, string msg);
}
