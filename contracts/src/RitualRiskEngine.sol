// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Testnet ONNX inference demo for Ritual Nexus.
/// @dev Calls Ritual's native ONNX precompile synchronously and decodes a single FLOAT32 result.
contract RitualRiskEngine {
    address public constant ONNX_PRECOMPILE = 0x0000000000000000000000000000000000000800;
    string public constant MODEL_ID =
        "hf/Ritual-Net/sample_linreg/linreg_10_features.onnx@fd0501654c4144a9900a670c5c9a074b6bd3d4ef";

    uint8 public constant DTYPE_FLOAT32 = 5;
    uint8 public constant ARITHMETIC_FLOAT = 2;
    uint8 public constant FIXED_POINT_SCALE = 0;
    uint8 public constant ROUNDING_NEAREST = 1;
    uint256 public constant INPUT_COUNT = 10;

    uint8 public constant RISK_LOW = 0;
    uint8 public constant RISK_MEDIUM = 1;
    uint8 public constant RISK_HIGH = 2;

    uint32 private constant FLOAT32_EXPONENT_MASK = 0x7F800000;
    uint32 private constant FLOAT32_LOW_THRESHOLD = 0x3F000000; // 0.5
    uint32 private constant FLOAT32_HIGH_THRESHOLD = 0x3FC00000; // 1.5
    uint32 private constant FLOAT32_SIGN_MASK = 0x80000000;

    address public lastUser;
    int32 public lastScore;
    uint8 public lastRiskLabel;
    uint256 public lastUpdatedAt;

    event RiskInference(address indexed user, int32 score, uint8 riskLabel, bytes rawTensor);

    error InvalidFloat32Input(uint256 index, int32 value);
    error OnnxCallFailed(bytes reason);
    error EmptyOnnxResponse();
    error UnexpectedOutputMetadata(uint8 outputArithmetic, uint8 outputScale, uint8 rounding);
    error UnexpectedTensorDtype(uint8 dtype);
    error UnexpectedTensorShape(uint16[] shape, uint256 valueCount);

    function runRisk(int32[10] calldata float32Inputs)
        external
        view
        returns (
            int32 score,
            uint8 riskLabel,
            bytes memory rawTensor,
            uint8 outputArithmetic,
            uint8 outputScale,
            uint8 rounding
        )
    {
        return _runRisk(float32Inputs);
    }

    function recordRisk(int32[10] calldata float32Inputs)
        external
        returns (
            int32 score,
            uint8 riskLabel,
            bytes memory rawTensor,
            uint8 outputArithmetic,
            uint8 outputScale,
            uint8 rounding
        )
    {
        (score, riskLabel, rawTensor, outputArithmetic, outputScale, rounding) = _runRisk(float32Inputs);
        lastUser = msg.sender;
        lastScore = score;
        lastRiskLabel = riskLabel;
        lastUpdatedAt = block.timestamp;

        emit RiskInference(msg.sender, score, riskLabel, rawTensor);
    }

    function encodeTensor(int32[10] calldata float32Inputs) external pure returns (bytes memory) {
        return _encodeTensor(float32Inputs);
    }

    function encodeRequest(int32[10] calldata float32Inputs) external pure returns (bytes memory) {
        return _encodeRequest(float32Inputs);
    }

    function riskLabelForScoreBits(int32 scoreBits) external pure returns (uint8) {
        return _riskLabelForScoreBits(scoreBits);
    }

    function _runRisk(int32[10] calldata float32Inputs)
        internal
        view
        returns (
            int32 score,
            uint8 riskLabel,
            bytes memory rawTensor,
            uint8 outputArithmetic,
            uint8 outputScale,
            uint8 rounding
        )
    {
        bytes memory request = _encodeRequest(float32Inputs);
        (bool ok, bytes memory response) = ONNX_PRECOMPILE.staticcall(request);

        if (!ok) revert OnnxCallFailed(response);
        if (response.length == 0) revert EmptyOnnxResponse();

        (rawTensor, outputArithmetic, outputScale, rounding) = abi.decode(response, (bytes, uint8, uint8, uint8));

        if (
            outputArithmetic != ARITHMETIC_FLOAT || outputScale != FIXED_POINT_SCALE
                || rounding != ROUNDING_NEAREST
        ) {
            revert UnexpectedOutputMetadata(outputArithmetic, outputScale, rounding);
        }

        (uint8 dtype, uint16[] memory shape, int32[] memory values) =
            abi.decode(rawTensor, (uint8, uint16[], int32[]));

        if (dtype != DTYPE_FLOAT32) revert UnexpectedTensorDtype(dtype);
        if (!_isSingleOutputShape(shape, values.length)) revert UnexpectedTensorShape(shape, values.length);

        score = values[0];
        riskLabel = _riskLabelForScoreBits(score);
    }

    function _encodeRequest(int32[10] calldata float32Inputs) internal pure returns (bytes memory) {
        return abi.encode(
            bytes(MODEL_ID),
            _encodeTensor(float32Inputs),
            ARITHMETIC_FLOAT,
            FIXED_POINT_SCALE,
            ARITHMETIC_FLOAT,
            FIXED_POINT_SCALE,
            ROUNDING_NEAREST
        );
    }

    function _encodeTensor(int32[10] calldata float32Inputs) internal pure returns (bytes memory) {
        uint16[] memory shape = new uint16[](2);
        shape[0] = 1;
        shape[1] = uint16(INPUT_COUNT);

        int32[] memory values = new int32[](INPUT_COUNT);
        for (uint256 i = 0; i < INPUT_COUNT; i++) {
            _validateFloat32(i, float32Inputs[i]);
            values[i] = float32Inputs[i];
        }

        return abi.encode(DTYPE_FLOAT32, shape, values);
    }

    function _validateFloat32(uint256 index, int32 value) internal pure {
        uint32 raw = uint32(value);
        if ((raw & FLOAT32_EXPONENT_MASK) == FLOAT32_EXPONENT_MASK) {
            revert InvalidFloat32Input(index, value);
        }
    }

    function _isSingleOutputShape(uint16[] memory shape, uint256 valueCount) internal pure returns (bool) {
        if (valueCount != 1) return false;
        if (shape.length == 1) return shape[0] == 1;
        if (shape.length == 2) return shape[0] == 1 && shape[1] == 1;
        return false;
    }

    function _riskLabelForScoreBits(int32 scoreBits) internal pure returns (uint8) {
        uint32 raw = uint32(scoreBits);
        if ((raw & FLOAT32_EXPONENT_MASK) == FLOAT32_EXPONENT_MASK) {
            revert InvalidFloat32Input(0, scoreBits);
        }
        if ((raw & FLOAT32_SIGN_MASK) != 0) return RISK_LOW;
        if (raw < FLOAT32_LOW_THRESHOLD) return RISK_LOW;
        if (raw < FLOAT32_HIGH_THRESHOLD) return RISK_MEDIUM;
        return RISK_HIGH;
    }
}
