// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

enum SESSION_STATUS {CREATED, INPROGRESS, CLOSE}

// Structure to hold details of Session
struct ISession {
    string productName;
    string description;
    string[] images;
    mapping(address => uint256) participantPrices;
    uint256 suggestPrice;
    uint256 finalPrice;
    SESSION_STATUS status;
}
