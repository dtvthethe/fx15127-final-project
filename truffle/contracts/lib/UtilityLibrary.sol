// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library UtilityLibrary {
    function abs(uint256 _input) internal pure returns (uint256) {
        if (_input < 0) {
            return _input * -1;
        }

        return _input;
    }
}
