// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {RitualRiskEngine} from "../src/RitualRiskEngine.sol";

contract RitualRiskEngineTest is Test {
    RitualRiskEngine private engine;

    event RiskInference(address indexed user, int32 score, uint8 riskLabel, bytes rawTensor);

    address private constant ONNX_PRECOMPILE = 0x0000000000000000000000000000000000000800;
    int32 private constant FLOAT_ZERO = int32(uint32(0x00000000));
    int32 private constant FLOAT_HALF = int32(uint32(0x3F000000));
    int32 private constant FLOAT_ONE = int32(uint32(0x3F800000));
    int32 private constant FLOAT_TWO = int32(uint32(0x40000000));
    int32 private constant FLOAT_NAN = int32(uint32(0x7FC00000));

    function setUp() public {
        engine = new RitualRiskEngine();
    }

    function testModelIdIsPinnedToFullCommitHash() public view {
        string memory modelId = engine.MODEL_ID();
        bytes memory raw = bytes(modelId);

        assertEq(
            modelId,
            "hf/Ritual-Net/sample_linreg/linreg_10_features.onnx@fd0501654c4144a9900a670c5c9a074b6bd3d4ef"
        );
        assertEq(raw.length, 92);
        assertEq(raw[51], bytes1("@"));
    }

    function testEncodeTensorUsesRitualTensorFloat32Shape() public view {
        int32[10] memory inputs = _sampleInputs();
        bytes memory encoded = engine.encodeTensor(inputs);

        (uint8 dtype, uint16[] memory shape, int32[] memory values) = abi.decode(encoded, (uint8, uint16[], int32[]));

        assertEq(dtype, engine.DTYPE_FLOAT32());
        assertEq(shape.length, 2);
        assertEq(shape[0], 1);
        assertEq(shape[1], 10);
        assertEq(values.length, 10);
        assertEq(values[0], FLOAT_ONE);
    }

    function testRunRiskDecodesMediumRiskResponse() public {
        int32[10] memory inputs = _sampleInputs();
        bytes memory request = engine.encodeRequest(inputs);
        bytes memory response = _onnxResponse(FLOAT_ONE, _singleShape());

        vm.mockCall(ONNX_PRECOMPILE, request, response);

        (int32 score, uint8 riskLabel, bytes memory rawTensor, uint8 arithmetic, uint8 scale, uint8 rounding) =
            engine.runRisk(inputs);

        assertEq(score, FLOAT_ONE);
        assertEq(riskLabel, engine.RISK_MEDIUM());
        assertGt(rawTensor.length, 0);
        assertEq(arithmetic, engine.ARITHMETIC_FLOAT());
        assertEq(scale, engine.FIXED_POINT_SCALE());
        assertEq(rounding, engine.ROUNDING_NEAREST());
    }

    function testRecordRiskStoresLastResultAndEmitsEvent() public {
        int32[10] memory inputs = _sampleInputs();
        bytes memory request = engine.encodeRequest(inputs);
        bytes memory response = _onnxResponse(FLOAT_TWO, _singleShape());

        vm.mockCall(ONNX_PRECOMPILE, request, response);
        vm.expectEmit(true, false, false, false, address(engine));
        emit RiskInference(address(this), FLOAT_TWO, engine.RISK_HIGH(), bytes(""));

        (int32 score, uint8 riskLabel,,,,) = engine.recordRisk(inputs);

        assertEq(score, FLOAT_TWO);
        assertEq(riskLabel, engine.RISK_HIGH());
        assertEq(engine.lastUser(), address(this));
        assertEq(engine.lastScore(), FLOAT_TWO);
        assertEq(engine.lastRiskLabel(), engine.RISK_HIGH());
        assertEq(engine.lastUpdatedAt(), block.timestamp);
    }

    function testRejectsNanInput() public {
        int32[10] memory inputs = _sampleInputs();
        inputs[3] = FLOAT_NAN;

        vm.expectRevert(abi.encodeWithSelector(RitualRiskEngine.InvalidFloat32Input.selector, 3, FLOAT_NAN));
        engine.encodeTensor(inputs);
    }

    function testBubblesFailedPrecompileCall() public {
        int32[10] memory inputs = _sampleInputs();
        bytes memory request = engine.encodeRequest(inputs);
        bytes memory reason = bytes("precompile failed");

        vm.mockCallRevert(ONNX_PRECOMPILE, request, reason);
        vm.expectRevert(abi.encodeWithSelector(RitualRiskEngine.OnnxCallFailed.selector, reason));
        engine.runRisk(inputs);
    }

    function testRejectsEmptyPrecompileResponse() public {
        int32[10] memory inputs = _sampleInputs();
        bytes memory request = engine.encodeRequest(inputs);

        vm.mockCall(ONNX_PRECOMPILE, request, bytes(""));
        vm.expectRevert(RitualRiskEngine.EmptyOnnxResponse.selector);
        engine.runRisk(inputs);
    }

    function testRejectsUnexpectedOutputMetadata() public {
        int32[10] memory inputs = _sampleInputs();
        bytes memory request = engine.encodeRequest(inputs);
        bytes memory tensor = _tensor(FLOAT_ONE, _singleShape());
        bytes memory response = abi.encode(tensor, uint8(1), uint8(0), uint8(1));

        vm.mockCall(ONNX_PRECOMPILE, request, response);
        vm.expectRevert(abi.encodeWithSelector(RitualRiskEngine.UnexpectedOutputMetadata.selector, 1, 0, 1));
        engine.runRisk(inputs);
    }

    function testRejectsUnexpectedTensorShape() public {
        int32[10] memory inputs = _sampleInputs();
        bytes memory request = engine.encodeRequest(inputs);
        uint16[] memory badShape = new uint16[](1);
        badShape[0] = 2;

        vm.mockCall(ONNX_PRECOMPILE, request, _onnxResponse(FLOAT_ONE, badShape));
        vm.expectRevert();
        engine.runRisk(inputs);
    }

    function testRiskLabelBoundaries() public view {
        assertEq(engine.riskLabelForScoreBits(FLOAT_ZERO), engine.RISK_LOW());
        assertEq(engine.riskLabelForScoreBits(FLOAT_HALF), engine.RISK_MEDIUM());
        assertEq(engine.riskLabelForScoreBits(FLOAT_ONE), engine.RISK_MEDIUM());
        assertEq(engine.riskLabelForScoreBits(FLOAT_TWO), engine.RISK_HIGH());
    }

    function _sampleInputs() private pure returns (int32[10] memory inputs) {
        inputs = [
            FLOAT_ONE,
            FLOAT_HALF,
            FLOAT_ZERO,
            FLOAT_ONE,
            FLOAT_HALF,
            FLOAT_ZERO,
            FLOAT_ONE,
            FLOAT_HALF,
            FLOAT_ZERO,
            FLOAT_ONE
        ];
    }

    function _singleShape() private pure returns (uint16[] memory shape) {
        shape = new uint16[](1);
        shape[0] = 1;
    }

    function _tensor(int32 score, uint16[] memory shape) private pure returns (bytes memory) {
        int32[] memory values = new int32[](1);
        values[0] = score;
        return abi.encode(uint8(5), shape, values);
    }

    function _onnxResponse(int32 score, uint16[] memory shape) private pure returns (bytes memory) {
        return abi.encode(_tensor(score, shape), uint8(2), uint8(0), uint8(1));
    }
}
