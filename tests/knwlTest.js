const Knwl = require('Knwl.js');
const knwlInst = new Knwl('english');

const knwlPhones = require('../lib/knwlPhones.js');

knwlInst.register('betterPhones', knwlPhones);

var string = 'This is a test to see if Knwl will detect a phone number (07445650906) (441614141080) (+44 161 414 1080) in a specific format.';

knwlInst.init(string);

var result = knwlInst.get('betterPhones');

console.log(result);