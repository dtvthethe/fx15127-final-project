// SPDX-License-Identifier: MIT
pragma solidity ^0.4.26;
pragma experimental ABIEncoderV2;
import "./lib/UtilityLibrary.sol";

// Interface of Main contract to call from Session contract
interface IMain {
    function addSession(address session) external;
    function getAdmin() external view returns (address);
    function getDeviation(address _account) external view returns (int);
    function setDeviation(address _session, address _account, int _deviation) external;
    function incrementNumberOfSession(address _account) external;
    function getNumberOfSession(address _account) external view returns(int);
}

contract Session {
    // Variable to hold Main Contract Address when create new Session Contract
    address public mainContract;
    // Variable to hold Main Contract instance to call functions from Main
    IMain MainContract;

    // TODO: Variables
    enum SESSION_STATUS {CREATED, PRICING, STOP}

    string private productName;
    string private description;
    string[] private images;
    uint private suggestPrice;
    int private finalPrice;
    SESSION_STATUS private status;
    mapping(address => int) private mapParticipantPricings;
    mapping(address => bool) private isParticipantPricingExists;
    address[] private participantPricings;
    address private adminAddr;

    using UtilityLibrary for int;

    constructor(
        address _mainContract,
        string memory _productName,
        string memory _description,
        string[] memory _images
    ) public {
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
        adminAddr = MainContract.getAdmin();

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

    // Get session detail.
    function getSessionDetail() public view returns(string memory, string memory, string[] memory, uint, int, uint) {
        return (productName, description, images, suggestPrice, finalPrice, uint(status));
    }

    // ..CREATED.. -> PRICING -> STOP
    // Update session status to PRICING.
    function startSession() public onlyAdmin {
        require(status == SESSION_STATUS.CREATED, "Session status must be CREATED");
        status = SESSION_STATUS.PRICING;
        emit UpdateSessionStatus("Update session status to PRICING");
    }

    // Participant pricing session.
    function pricing(int _price) public onlyParticipant onlyInProgress {
        if (isParticipantPricingExists[msg.sender] == false) {
            isParticipantPricingExists[msg.sender] = true;
            participantPricings.push(msg.sender);
        }

        mapParticipantPricings[msg.sender] = _price;
        emit Pricing(msg.sender, "Pricing success!");
    }

    // Get participant pricings.
    function getParticipantPricings() public view returns (address[] memory) {
        return participantPricings;
    }

    // Get Participant pricing exists.
    function getParticipantPricingExists(address _paticipant) public view returns (bool) {
        return isParticipantPricingExists[_paticipant];
    }

    // Calculate suggest price.
    function calculateSuggestPrice(int _price) private {
        int _suggestPrice = 0;
        int _sumOfPriceWithDeviation = 0;
        int _sumOfDeviation = 0;

        for (uint i = 0; i < participantPricings.length; i++) {
            int _deviation = MainContract.getDeviation(participantPricings[i]);
            _sumOfPriceWithDeviation += mapParticipantPricings[participantPricings[i]] * (100 - _deviation);
            _sumOfDeviation += _deviation;
        }

        _suggestPrice = _sumOfPriceWithDeviation / ((100 * int(participantPricings.length)) - _sumOfDeviation);
        suggestPrice = uint(_suggestPrice);
        finalPrice = _price;
    }

    // Calculate deviation in session.
    function calculateDeviationInSession(address _account) private view returns (int) {
        int _subDeviation = (finalPrice - mapParticipantPricings[_account]).abs();
        int _subDeviationResult = ((_subDeviation * 10**18) / finalPrice) * 100;

        return _subDeviationResult / 10**18;
    }

    // Calculate deviation and upstate session status to STOP
    function calculateDeviationLatestAndStop() private {
        for (uint i = 0; i < participantPricings.length; i++) {
            address _account = participantPricings[i];
            int _deviation = MainContract.getDeviation(_account);
            int _numberOfSession = MainContract.getNumberOfSession(_account);
            int _subDeviation = (_deviation * _numberOfSession) + calculateDeviationInSession(_account);
            int _newDeviation = _subDeviation / (_numberOfSession + 1);
            MainContract.setDeviation(address(this), _account, _newDeviation);
            MainContract.incrementNumberOfSession(_account);
        }

        status = SESSION_STATUS.STOP;
        emit UpdateSessionStatus("Calculate and update session status to STOP");
    }

    // Stop session and calculate deviation on each participant.
    function stopSession(int _price) public onlyAdmin onlyInProgress {
        if (participantPricings.length == 0) {
            finalPrice = _price;
            status = SESSION_STATUS.STOP;
        } else {
            calculateSuggestPrice(_price);
            calculateDeviationLatestAndStop();
        }
    }

    // Get participant pricing
    function getPricingByParticipant() public onlyParticipant view returns(int) {
        if (isParticipantPricingExists[msg.sender] == true) {
            return mapParticipantPricings[msg.sender];
        } else {
            return 0;
        }
    }

    // Get all prices
    function getAllPrices() public onlyAdmin() view returns(int[]) {
        int[] memory prices = new int[](participantPricings.length);

        for (uint8 i = 0; i < participantPricings.length; i++) {
            prices[i] = mapParticipantPricings[participantPricings[i]];
        }

        return prices;
    }

    // Modify only status is PRICING.
    modifier onlyInProgress {
        require(status == SESSION_STATUS.PRICING, "Session is not in progress");
        _;
    }

    // Modify to check only admin.
    modifier onlyAdmin() {
        require(msg.sender == adminAddr, "This function only admin can execute!");
        _;
    }

    // Modify to check only participant.
    modifier onlyParticipant() {
        require(msg.sender != adminAddr, "This function only participant can execute!");
        _;
    }

    // Event create session.
    event CreateSession(string _productName, string _description, string _msg);

    // Event update session.
    event UpdateSession(string _productName, string _description, string _msg);

    // Event update session status.
    event UpdateSessionStatus(string _msg);

    // Event pricing.
    event Pricing(address _account, string _msg);
}
