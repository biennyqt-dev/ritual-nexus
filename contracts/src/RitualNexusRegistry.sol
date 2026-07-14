// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal immutable deployment marker for the Ritual Nexus educational shortcut dApp.
/// @dev This contract intentionally stores only public metadata and is not connected to the UI.
contract RitualNexusRegistry {
    string public constant name = "Ritual Nexus";
    string public constant homepage = "https://github.com/biennyqt-dev/ritual-nexus";
    uint256 public immutable deployedAt;
    address public immutable deployer;

    event RitualNexusRegistered(address indexed deployer, uint256 deployedAt);

    constructor() {
        deployer = msg.sender;
        deployedAt = block.timestamp;
        emit RitualNexusRegistered(msg.sender, block.timestamp);
    }
}
