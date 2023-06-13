// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// import "./lib/UtilityLibrary.sol";

// Interface of Main contract to call from Session contract
interface IMain {
    function addSession(address session) external;
    function getAdmin() external view returns (address);
}

contract Session {
    // Variable to hold Main Contract Address when create new Session Contract
    address public mainContract;
    // Variable to hold Main Contract instance to call functions from Main
    IMain MainContract;

    // TODO: Variables
    enum SESSION_STATUS {CREATED, INPROGRESS, CLOSE}

    string private productName;
    string private description;
    string[] private images;
    uint256 private suggestPrice;
    uint256 private finalPrice;
    SESSION_STATUS private status;
    mapping(address => uint256) private mapParticipantPricings;
    address[] private participantPricings;

    // using UtilityLibrary for uint256;

    constructor(
        address _mainContract,
        string memory _productName,
        string memory _description,
        string[] memory _images
    ) {
        // Get Main Contract instance
        mainContract = _mainContract;
        MainContract = IMain(_mainContract);

        // TODO: Init Session contract
        productName = _productName;
        description = _description;
        images = _images;
        suggestPrice = 0;
        finalPrice = 0;
        status = SESSION_STATUS.CREATED;

        // Call Main Contract function to link current contract.
        MainContract.addSession(address(this));
    }

    //Update session.
    function updateSession(string memory _productName, string memory _description, string[] memory _images) public onlyAdmin {
        // TODO
        productName = _productName;
        description = _description;
        images = _images;
    }

    // TODO: Functions
    // Set status to INPROGRESS.
    function startSession() public onlyAdmin {
        status = SESSION_STATUS.INPROGRESS;
    }

    // Set status to CLOSE.
    function closeSession() public onlyAdmin {
        status = SESSION_STATUS.CLOSE;
    }

    // Participant pricing.
    function pricing(address _account, uint256 _price) public onlyParticipant onlyInProgress {
        mapParticipantPricings[_account] = _price;

        if (mapParticipantPricings[_account] == 0) {
            // check this work?
            participantPricings.push(_account);
        }
    }

    // Get session detail.
    function getSessionDetail() public view returns(string memory, string memory, string[] memory, uint256, uint256, uint8) {

        return (productName, description, images, suggestPrice, finalPrice, uint8(status));
 
        // mapping(address => uint256) private mapParticipantPricings;
        // address[] private participantPricings;
    }

    // Caluculate functions.

    // Modify only status is INPROGRESS.
    modifier onlyInProgress {
        require(status == SESSION_STATUS.INPROGRESS, "Session is not in progress");
        _;
    }

    // Modify to check only admin.
    modifier onlyAdmin() {
        require(msg.sender == MainContract.getAdmin(), "This function only admin can execute!");
        _;
    }

    // Modify to check only participant.
    modifier onlyParticipant() {
        // TODO: viet lai modifier nay
        require(msg.sender != MainContract.getAdmin(), "This function only participant can execute!");
        _;
    }

    // Modify finalPrice must set value.
    modifier onlyFinalPriceMustSetValue() {
        require(finalPrice > 0, "Final price must set value!");
        _;
    }
}
