// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./modal/ISession.sol";
import "./lib/UtilityLibrary.sol";

// Interface of Main contract to call from Session contract
interface IMain {
    function addSession(address session) external;
    function getParticipant(address _account) external view returns (IParticipant memory);
}

contract Session {
    // Variable to hold Main Contract Address when create new Session Contract
    address public mainContract;
    // Variable to hold Main Contract instance to call functions from Main
    IMain MainContract;

    // TODO: Variables
    ISession private session;
    adsress[] private participantPricings;

    using UtilityLibrary for uint256;

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
        session = ISession(_productName, _description, _images, [], 0, 0, SESSION_STATUS.CREATED);

        // Call Main Contract function to link current contract.
        MainContract.addSession(address(this));
    }

    //Update session.
    function updateSession(string _productName, string _description, string[] images) public onlyAdmin {
        // TODO
        session.productName = _productName;
        session.description = _description;
        session.images = _images;
    }

    // TODO: Functions
    // Set status to INPROGRESS.
    function startSession() public onlyAdmin {
        session.status = SESSION_STATUS.INPROGRESS;
    }

    // Set status to CLOSE.
    function closeSession() public onlyAdmin {
        session.status = SESSION_STATUS.CLOSE;
    }

    // Participant pricing.
    function pricing(address _account, uint256 _price) public onlyParticipant onlyInProgress {
        if (session.participantPrices[_account] == 0) {
            participantPricings.push(_account);
        }

        session.participantPrices[_account] = _price;
    }

    // Calculate suggest price.
    function calculateSuggestPrice() public onlyAdmin {
        mapping(address => uint256) prices = session.participantPrices;
        uint256 _suggestPrice = 0;
        uint256 sumOfPriceWithDeviation = 0;
        uint256 sumOfDeviation = 0;

        for (uint256 i = 0; i < participantPricings.length; i++) {
            sumOfPriceWithDeviation += prices[participantPricings[i]] * (100 - saiSoNguoiDinhGiaI);
            sumOfDeviation += saiSoNguoiDinhGiaI;
        }

        _suggestPrice = sumOfPriceWithDeviation / ((100 * participantPricings.length) - sumOfDeviation);
        session.suggestPrice = _suggestPrice;
    }

    // Calculate deviation in session.
    function calculateDeviationInSession(address _account) public onlyAdmin onlyFinalPriceMustSetValue returns (uint256) {
        uint256 _deviation = 0;
        uint256 _subDeviation = (session.finalPrice - session.participantPrices[_account]).abs();
        _deviation = (_subDeviation / session.finalPrice) * 100;

        return _deviation;
    }

    // Calculate deviation.
    function calculateDeviation(address _account) public onlyAdmin onlyFinalPriceMustSetValue returns (uint256) {
        uint256 _deviation = 0;
        // TODO: confirm lai cong thuc tinh deviation.
        uint256 _subDeviation = (MainContract.getParticipant(_account).deviation * n) + calculateDeviationInSession(_account);
        _deviation = _subDeviation / (n + 1);
        return _deviation;
    }

    // Modify only status is INPROGRESS.
    modifier onlyInProgress {
        require(session.status == SESSION_STATUS.INPROGRESS, "Session is not in progress");
        _;
    }

    // Modify to check only admin.
    modifier onlyAdmin() {
        require(msg.sender == MainContract.admin, "This function only admin can execute!");
        _;
    }

    // Modify to check only participant.
    modifier onlyParticipant() {
        // TODO: viet lai modifier nay
        require(msg.sender != MainContract.admin, "This function only participant can execute!");
        _;
    }

    // Modify finalPrice must set value.
    modifier onlyFinalPriceMustSetValue() {
        require(session.finalPrice > 0, "Final price must set value!");
        _;
    }
}
