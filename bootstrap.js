/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also do this by creating a hook.
 *
 * For more information on bootstrapping your app, check out:
 * https://sailsjs.com/config/bootstrap
 */

module.exports.bootstrap = function (done) {

	var SerialPort = require('serialport');
	const Readline = SerialPort.parsers.Readline;

	global.port = new SerialPort('/dev/ttyUSB0', {
		baudRate: 9600,
		dataBits: 8,
		hupddcl: false,
		stopBits: 1,
		parity: "none"
	});

	global.port.on('open', function () {
		console.log("Port Open!");
		
		const parser = global.port.pipe(new Readline({
			delimiter: '.'
		}));
		parser.on('data', d => {
			console.log(d);
		});
		
		sails.helpers.grid().then((grid) => (global._grid = grid).initialise());
				
		console.log("connecting grid...");
		global.port.write("I0.");

	});




	return done();

};
