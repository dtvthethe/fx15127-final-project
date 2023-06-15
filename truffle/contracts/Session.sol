// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./lib/UtilityLibrary.sol";

// Interface of Main contract to call from Session contract
interface IMain {
    function addSession(address session) external;
    function getAdmin() external view returns (address);
    function getDeviation(address _account) external view returns (int);
    function setDeviation(address _account, int _deviation) external;
    function incrementNumberOfSession(address _account) external;
    function getNumberOfSession(address _account) external view returns(int);
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
    uint private suggestPrice;
    int private finalPrice;
    SESSION_STATUS private status;
    mapping(address => int) private mapParticipantPricings;
    address[] private participantPricings;

    using UtilityLibrary for int;

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
        emit CreateSession(_productName, _description, "Create session success!");
    }

    //Update session.
    function updateSession(string memory _productName, string memory _description, string[] memory _images) public onlyAdmin {
        productName = _productName;
        description = _description;
        images = _images;
        emit UpdateSession(_productName, _description, "Update session success!");
    }

    // TODO: Functions
    // Set status to INPROGRESS.
    function startSession() public onlyAdmin {
        status = SESSION_STATUS.INPROGRESS;

        emit StartSession("Start session success!");
    }

    // Set status to CLOSE.
    function closeSession() public onlyAdmin {
        status = SESSION_STATUS.CLOSE;
        emit CloseSession("Close session success!");
    }

    // Participant pricing.
    function pricing(address _account, int _price) public onlyParticipant onlyInProgress {
        mapParticipantPricings[_account] = _price;

        if (mapParticipantPricings[_account] == 0) {
            // check this work?
            participantPricings.push(_account);
            MainContract.incrementNumberOfSession(_account);
        }

        emit Pricing(_account, "Pricing success!");
    }

    // Get session detail.
    function getSessionDetail() public view returns(string memory, string memory, string[] memory, uint, int, uint) {
        return (productName, description, images, suggestPrice, finalPrice, uint(status));
    }

    // Calculate suggest price.
    function calculateSuggestPrice() public onlyAdmin {
        int _suggestPrice = 0;
        int _sumOfPriceWithDeviation = 0;
        int _sumOfDeviation = 0;

        for (uint i = 0; i < participantPricings.length; i++) {
            // TODO: ko co thi return 0
            int _deviation = MainContract.getDeviation(participantPricings[i]);
            _sumOfPriceWithDeviation += mapParticipantPricings[participantPricings[i]] * (100 - _deviation);
            _sumOfDeviation += _deviation;
        }

        _suggestPrice = _sumOfPriceWithDeviation / ((100 * int(participantPricings.length)) - _sumOfDeviation);
        suggestPrice = uint(_suggestPrice);
    }

    // Calculate deviation in session.
    function calculateDeviationInSession(address _account) public view onlyAdmin onlyFinalPriceMustSetValue returns (int) {
        int _subDeviation = (finalPrice - mapParticipantPricings[_account]).abs();

        return (_subDeviation / finalPrice) * 100;
    }

    // Calculate deviation.
    function calculateDeviationLatest(address _account) public onlyAdmin onlyFinalPriceMustSetValue {
        int _deviation = MainContract.getDeviation(_account);
        int _subDeviation = (_deviation * MainContract.getNumberOfSession(_account)) + calculateDeviationInSession(_account);
        int _newDeviation = _subDeviation / (_deviation + 1);
        MainContract.setDeviation(_account, _newDeviation);
    }

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

    // Event create session.
    event CreateSession(string _productName, string _description, string _msg);

    // Event update session.
    event UpdateSession(string _productName, string _description, string _msg);

    // Event start session.
    event StartSession(string _msg);

    // Event close session.
    event CloseSession(string _msg);

    // Event pricing.
    event Pricing(address _account, string _msg);
}
