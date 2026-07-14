// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {RitualNexusRegistry} from "../src/RitualNexusRegistry.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        RitualNexusRegistry registry = new RitualNexusRegistry();
        vm.stopBroadcast();

        console2.log("RitualNexusRegistry deployed to:", address(registry));
        console2.log("Ritual chain ID:", block.chainid);
    }
}
