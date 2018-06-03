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

	console.log("opening browser");
	require('child_process').exec("chromium-browser --incognito --start-maximized --kiosk http://localhost:1337");
	console.log("starting music");
	require('child_process').exec("amixer sset PCM 100; mpg123 -l -1 /home/pi/Desktop/www/assets/discotrack.mp3");

	var SerialPort = require('serialport');
	const Readline = SerialPort.parsers.Readline;

	global.port = new SerialPort('/dev/ttyUSB0', {
		baudRate: 9600,
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
