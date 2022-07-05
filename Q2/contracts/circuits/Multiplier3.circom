pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals

template Multiplier2 () {

   // Declaration of signals.
   signal input a;
   signal input b;
   signal output ab;

   // Constraints.
   ab <== a * b;
}

template Multiplier3 () {  

   // Declaration of signals.  
   signal input a;
   signal input b;
   signal input c;
   signal output abc;

   component m2 = Multiplier2();
   m2.a <== a;
   m2.b <== b;

   // Constraints.
   abc <== m2.ab * c;
}

component main = Multiplier3();