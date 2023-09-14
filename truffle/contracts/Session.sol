// SPDX-License-Identifier: MIT
pragma solidity ^0.4.26;
pragma experimental ABIEncoderV2;
import "./lib/NumberLibrary.sol";

interface IMain {
    /**
     * Add a Session Contract address into Main Contract. Use to link Session with Main.
     *
     * @param session Session address
     */
    function addSession(address session) external;

    /**
     * Get deviation by participant address.
     *
     * @param _account participant address
     *
     * @return int
     */
    function getDeviation(address _account) external view returns (int);

    /**
     * Set deviation for a participant.
     *
     * @param _session session address 
     * @param _account participant address
     * @param _deviation deviation vslue 
     */
    function setDeviation(address _session, address _account, int _deviation) external;

    /**
     * Increment numnber of session for a participant.
     *
     * @param _account participant address
     */
    function incrementNumberOfSession(address _account) external;

    /**
     * Get number of session by participant.
     *
     * @param _account participant address
     *
     * @return int
     */
    function getNumberOfSession(address _account) external view returns(int);
}

contract Session {
    /**
     * Main contract address
     */
    address public mainContract;

    /**
     * Variable to hold Main Contract instance to call functions from Main
     */
    IMain MainContract;

    /**
     * Session status:
     *
     * 0: CREATED
     * 1: PRICING
     * 2: STOP
     */
    enum SESSION_STATUS {CREATED, PRICING, STOP}

    /**
     * Session/Product name
     */
    string private productName;

    /**
     * Session/Product description
     */
    string private description;

    /**
     * Image list
     */
    string[] private images;

    /**
     * Sugest price - Proposal price
     */
    uint private suggestPrice;

    /**
     * Final price
     */
    int private finalPrice;

    /**
     * Session status
     */
    SESSION_STATUS private status;

    /**
     * List of mapping participant join to pricing
     */
    mapping(address => int) private mapParticipantPricings;

    /**
     * List of mark participant join to pricing
     */
    mapping(address => bool) private isParticipantPricingExists;

    /**
     * Array of participant address join to pricing
     */
    address[] private participantPricings;

    /**
     * Administrator address
     */
    address public admin;

    using NumberLibrary for int;

    /**
     * Main constructor.
     *
     * @param _mainContract Main address
     * @param _productName product name
     * @param _description Session description.
     * @param _images List of array
     * @param _admin Admin address
     */
    constructor(
        address _mainContract,
        string memory _productName,
        string memory _description,
        string[] memory _images,
        address _admin
    ) public {
        // Get Main Contract address
        mainContract = _mainContract;
        // Get Main Contract instance
        MainContract = IMain(_mainContract);
        productName = _productName;
        description = _description;
        images = _images;
        suggestPrice = 0;
        finalPrice = 0;
        status = SESSION_STATUS.CREATED;
        admin = _admin;
        // Call Main Contract function to link current contract.
        MainContract.addSession(address(this));
        emit CreateSession(_productName, _description, "Create session success!");
    }

    /**
     * Event create session.
     */
    event CreateSession(string _productName, string _description, string _msg);

    /**
     * Event update session.
     */
    event UpdateSession(string _productName, string _description, string _msg);

    /**
     * Event update session status.
     */
    event UpdateSessionStatus(string _msg);

    /**
     * Event pricing.
     */
    event Pricing(address _account, string _msg);

    /**
     * Update session.
     *
     * @param _productName session/product name
     * @param _description description
     * @param _images Array of product images
     */
    function updateSession(string memory _productName, string memory _description, string[] memory _images) public onlyAdmin {
        productName = _productName;
        description = _description;
        images = _images;
        emit UpdateSession(_productName, _description, "Update session success!");
    }

    /**
     * Get session detail.
     *
     * @return string session name
     * @return string session description
     * @return string[] Array of product images
     * @return uint suggest price
     * @return int final price
     * @return uint status
     */
    function getSessionDetail() public view returns(string memory, string memory, string[] memory, uint, int, uint) {
        return (productName, description, images, suggestPrice, finalPrice, uint(status));
    }

    /**
     * Update session status to PRICING.
     * CREATED -> PRICING -> STOP
     */
    function startSession() public onlyAdmin {
        require(status == SESSION_STATUS.CREATED, "Session status must be CREATED");
        status = SESSION_STATUS.PRICING;
        emit UpdateSessionStatus("Update session status to PRICING");
    }

    /**
     * Participant pricing session.
     *
     * @param _price price participant submit
     */
    function pricing(int _price) public onlyParticipant onlyInProgress {
        if (isParticipantPricingExists[msg.sender] == false) {
            isParticipantPricingExists[msg.sender] = true;
            participantPricings.push(msg.sender);
        }

        mapParticipantPricings[msg.sender] = _price;
        emit Pricing(msg.sender, "Pricing success!");
    }

    /**
     * Get participant pricings.
     *
     * @return address[] Array of participant prices
     */
    function getParticipantPricings() public view returns (address[] memory) {
        return participantPricings;
    }

    /**
     * Get Participant pricing exists.
     *
     * @param _paticipant participant address
     *
     * @return bool is participant is exists in this session
     */
    function getParticipantPricingExists(address _paticipant) public view returns (bool) {
        return isParticipantPricingExists[_paticipant];
    }

    /**
     * Calculate suggest price.
     *
     * @param _price final price
     */
    function calculateSuggestPrice(int _price) private {
        int _suggestPrice = 0;
        int _sumOfPriceWithDeviation = 0;
        int _sumOfDeviation = 0;

        // Get current deviation
        // calculate sum of deviation
        for (uint i = 0; i < participantPricings.length; i++) {
            int _deviation = MainContract.getDeviation(participantPricings[i]);
            _sumOfPriceWithDeviation += mapParticipantPricings[participantPricings[i]] * (100 - _deviation);
            _sumOfDeviation += _deviation;
        }

        // calculate suggest price
        _suggestPrice = _sumOfPriceWithDeviation / ((100 * int(participantPricings.length)) - _sumOfDeviation);
        suggestPrice = uint(_suggestPrice);
        // set final price
        finalPrice = _price;
    }

    /**
     * Calculate participant's deviation in session.
     *
     * @param _account Participant address
     *
     * @return int deviation
     */
    function calculateDeviationInSession(address _account) private view returns (int) {
        int _subDeviation = (finalPrice - mapParticipantPricings[_account]).abs();
        int _subDeviationResult = (_subDeviation.compress() / finalPrice) * 100;

        return _subDeviationResult.extract();
    }

    /**
     * Calculate deviation and upstate session status to STOP
     */
    function calculateDeviationLatestAndStop() private {
        // Scan on each participant 
        for (uint i = 0; i < participantPricings.length; i++) {
            address _account = participantPricings[i];
            // Get current participant deviation
            int _deviation = MainContract.getDeviation(_account);
            // Get current number of session
            int _numberOfSession = MainContract.getNumberOfSession(_account);
            // Calculate new deviation
            int _subDeviation = (_deviation * _numberOfSession) + calculateDeviationInSession(_account);
            int _newDeviation = _subDeviation / (_numberOfSession + 1);
            // Update new deviation, number of session
            MainContract.setDeviation(address(this), _account, _newDeviation);
            MainContract.incrementNumberOfSession(_account);
        }

        // Update Session status to STOP
        status = SESSION_STATUS.STOP;
        emit UpdateSessionStatus("Calculate and update session status to STOP");
    }

    /**
     * Stop session and calculate deviation on each participant.
     *
     * @param _price final price
     */
    function stopSession(int _price) public onlyAdmin onlyInProgress {
        if (participantPricings.length == 0) {
            finalPrice = _price;
            status = SESSION_STATUS.STOP;
        } else {
            calculateSuggestPrice(_price);
            calculateDeviationLatestAndStop();
        }
    }

    /**
     * Get participant pricing.
     *
     * @return int price
     */
    function getPricingByParticipant() public onlyParticipant view returns(int) {
        if (isParticipantPricingExists[msg.sender] == true) {
            return mapParticipantPricings[msg.sender];
        } else {
            return 0;
        }
    }

    /**
     * Get all prices.
     *
     * @return int[] Array of prices
     */
    function getAllPrices() public onlyAdmin() view returns(int[]) {
        int[] memory prices = new int[](participantPricings.length);

        for (uint8 i = 0; i < participantPricings.length; i++) {
            prices[i] = mapParticipantPricings[participantPricings[i]];
        }

        return prices;
    }

    /**
     * Modify only status is PRICING.
     */
    modifier onlyInProgress {
        require(status == SESSION_STATUS.PRICING, "Session is not in progress");
        _;
    }

    /**
     * Modify to check only admin.
     */
    modifier onlyAdmin() {
        require(msg.sender == admin, "This function only admin can execute!");
        _;
    }

    /**
     * Modify to check only participant.
     */
    modifier onlyParticipant() {
        require(msg.sender != admin, "This function only participant can execute!");
        _;
    }
}
