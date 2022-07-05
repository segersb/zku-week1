const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16, plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("HelloWorld", function () {
    this.timeout(100000000);
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Circuit should multiply two numbers correctly", async function () {
        const circuit = await wasm_tester("contracts/circuits/HelloWorld.circom");

        const INPUT = {
            "a": 2,
            "b": 3
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(6)));

    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        // create a proof with the required hidden input data, this step would be executed by the prover
        const { proof, publicSignals } = await groth16.fullProve({a:"2", b:"3"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        // log the output of the proof, in this case there is only one output value containing the multiplication
        console.log('2x3 =',publicSignals[0]);

        // create data required to call the verifier smart contract
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

        // extract all values from calldata to an array and convert from hex string to plain string
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        // construct the variables to call the verifier smart contract
        // note that a,b,c are related to the math behind the proof and not our circuit variables
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // assert that the generated proof is valid
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    this.timeout(100000000);
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Circuit should multiply three numbers correctly", async function () {
        //[assignment] insert your script here

        // create a circuit object
        const circuit = await wasm_tester("contracts/circuits/Multiplier3.circom");

        // construct test input
        const INPUT = {
            "a": 2,
            "b": 3,
            "c": 7,
        }

        // run the circuit and returns the witness which contains the input/outputs and memory of the circuit execution
        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(42)));

    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here

        // create a proof with the required hidden input data, this step would be executed by the prover
        const proveStart = Date.now()
        const { proof, publicSignals } = await groth16.fullProve({a:"2", b:"3", c:"7"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");

        // log the output of the proof, in this case there is only one output value containing the multiplication
        console.log('proof time', Date.now() - proveStart)
        console.log('proof size', JSON.stringify(proof).length)
        console.log('2x3x7 =',publicSignals[0]);

        // create data required to call the verifier smart contract
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

        // extract all values from calldata to an array and convert from hex string to plain string
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        // construct the variables to call the verifier smart contract
        // note that a,b,c are related to the math behind the proof and not our circuit variables
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // assert that the generated proof is valid
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });

    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {
    this.timeout(100000000);
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier_plonk");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here

        // create a proof with the required hidden input data, this step would be executed by the prover
        const proveStart = Date.now()
        const { proof, publicSignals } = await plonk.fullProve({a:"2", b:"3", c:"7"}, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_plonk/circuit_final.zkey");

        // log the output of the proof, in this case there is only one output value containing the multiplication
        console.log('proof time', Date.now() - proveStart)
        console.log('proof size', JSON.stringify(proof).length)
        console.log('2x3x7 =',publicSignals[0]);

        // create data required to call the verifier smart contract
        const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

        // extract all values from calldata to an array
        const argv = calldata.replace(/["[\]\s]/g, "").split(',')

        // construct the variables to call the verifier smart contract
        const proofArg = argv[0];
        const publicSignalsArg = argv.slice(1);

        // assert that the generated proof is valid
        expect(await verifier.verifyProof(proofArg, publicSignalsArg)).to.be.true;
    });
    
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        const proofArg = '0x0000000000000000000000000000000000000000000000000000000000000000'
        const publicSignalsArg = ['0']
        expect(await verifier.verifyProof(proofArg, publicSignalsArg)).to.be.false;
    });
});