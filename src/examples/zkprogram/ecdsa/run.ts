import { Secp256k1, Ecdsa, ecdsaProgram } from './ecdsa.js';
import assert from 'assert';

// create an example ecdsa signature

let privateKey = Secp256k1.Scalar.random();
let publicKey = Secp256k1.generator.scale(privateKey);

// TODO use an actual keccak hash
let messageHash = Secp256k1.Scalar.random();

let signature = Ecdsa.sign(messageHash.toBigInt(), privateKey.toBigInt());

// investigate the constraint system generated by ECDSA verify

console.time('ecdsa verify (build constraint system)');
let cs = ecdsaProgram.analyzeMethods().verifyEcdsa;
console.timeEnd('ecdsa verify (build constraint system)');

console.log(cs.summary());

// compile and prove

console.time('ecdsa verify (compile)');
await ecdsaProgram.compile();
console.timeEnd('ecdsa verify (compile)');

console.time('ecdsa verify (prove)');
let proof = await ecdsaProgram.verifyEcdsa(messageHash, signature, publicKey);
console.timeEnd('ecdsa verify (prove)');

proof.publicOutput.assertTrue('signature verifies');
assert(await ecdsaProgram.verify(proof), 'proof verifies');
