const FIREBASE_SECRET = process.env.FIREBASE_SECRET;
const TOKEN_DATA = { project: 'g0v-live' };

var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator(FIREBASE_SECRET);
var token = tokenGenerator.createToken(TOKEN_DATA);
console.log(token);


