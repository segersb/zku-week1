pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

// hint: you can use more than one templates in circomlib-matrix to help you
include "../../node_modules/circomlib-matrix/circuits/transpose.circom";
include "../../node_modules/circomlib-matrix/circuits/matMul.circom";
include "../../node_modules/circomlib-matrix/circuits/matSub.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemSum.circom";

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here
    component ATranspose = transpose(n,n);
    component xATranspose = matMul(1, n, n);
    component xATransposeMinB = matSub(1, n);
    component xATransposeMinBSum = matElemSum(1, n);
    component xATransposeMinBSumIsZero = IsEqual();

    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            ATranspose.a[i][j] <== A[i][j];
        }
    }

    for (var i = 0; i < n; i++) {
        xATranspose.a[0][i] <== x[i];
        for (var j = 0; j < n; j++) {
            xATranspose.b[i][j] <== ATranspose.out[i][j];
        }
    }

    for (var i = 0; i < n; i++) {
        xATransposeMinB.a[0][i] <== xATranspose.out[0][i];
        xATransposeMinB.b[0][i] <== b[i];
    }

    for (var i = 0; i < n; i++) {
        xATransposeMinBSum.a[0][i] <== xATransposeMinB.out[0][i];
    }

    xATransposeMinBSumIsZero.in[0] <== xATransposeMinBSum.out;
    xATransposeMinBSumIsZero.in[1] <== 0;
    out <== xATransposeMinBSumIsZero.out;
}

component main {public [A, b]} = SystemOfEquations(3);