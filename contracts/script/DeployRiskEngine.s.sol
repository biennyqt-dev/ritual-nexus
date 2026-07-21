// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {RitualRiskEngine} from "../src/RitualRiskEngine.sol";

contract DeployRiskEngineScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        RitualRiskEngine riskEngine = new RitualRiskEngine();
        vm.stopBroadcast();

        console2.log("RitualRiskEngine deployed to:", address(riskEngine));
        console2.log("Ritual chain ID:", block.chainid);
        console2.log("Pinned ONNX model:", riskEngine.MODEL_ID());
    }
}
