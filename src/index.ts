import {BlaubergVentoClient} from './client/blauberg-vento-client';

console.log('bla');
const client = new BlaubergVentoClient();
client.findDevices().then(result => console.log(result));
