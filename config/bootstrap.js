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
		baudRate: 19200,
		dataBits: 8,
		hupddcl: false,
		stopBits: 1,
		parity: "none"
	});

	const parser = global.port.pipe(new Readline({
		delimiter: '.'
	}));

	parser.on('data', d => {
		//console.log(d);

		if(d==global.lastCommand) return;

		switch (d.substr(0, 1)) {
			case "I":
				clearInterval(global.sender);
				global.segments = parseInt(d.substr(1));
				global.segments = global.segments == 0 ? 1 : global.segments
				console.log(global.segments + " segments registered")
				sails.helpers.grid().then((grid) => (global._grid = grid).initialise());
				break;
			case "R":
				global._grid.report(d);
				break;

		}

		global.commandBeforeThat=global.lastCommand
		global.lastCommand=d

	});

	global.port.on('open', function () {
		console.log("Port Open!");
		global.port.flush();

		console.log("connecting grid...");
		global._segments = -1;

		global.sender = setInterval(() => {
			global.port.write("I0.");
		}, 500);


		global.port.write("I0.");

	});


	return done();

};
