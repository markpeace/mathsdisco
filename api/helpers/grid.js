module.exports = {


	friendlyName: 'Grid',


	description: 'Grid something.',


	inputs: {

	},


	exits: {

	},


	fn: function (inputs, exits) {

		r = {}
		r.initialise = function () {

			console.log("(re)initialising grid");

			var _gridMap = []
			for(s=1;s<=global.segments;s++) {
				for(g=0;g<=5;g++) {
					_gridMap.push(parseInt(""+s+g))
				}
			}

			global.grid = []
			dummyGrid = [];
			for (g = 0; g < _gridMap.length; g++) {
				dummyGrid.push(g);
				global.grid[g] = {
					_n: g,
					hwAddr: _gridMap[g],
					selected: false
				}
			}

			for (let i = dummyGrid.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[dummyGrid[i], dummyGrid[j]] = [dummyGrid[j], dummyGrid[i]]; // eslint-disable-line no-param-reassign
			}

			var effects = [{
				effect: "+2",
				prevalence: 9 / 36, //RED
				on: {
					colour: 0,
					brightness: 150
				},
				off: {
					colour: 0,
					brightness: 255
				},
			}, {
				effect: "-2",
				prevalence: 9 / 36, //GREEN
				on: {
					colour: 60,
					brightness: 150
				},
				off: {
					colour: 60,
					brightness: 255
				},
			}, {
				effect: "+6",
				prevalence: 6 / 36, //BLUE
				on: {
					colour: 120,
					brightness: 150
				},
				off: {
					colour: 120,
					brightness: 255
				},
			}, {
				effect: "-6",
				prevalence: 6 / 36, //
				on: {
					colour: 180,
					brightness: 150
				},
				off: {
					colour: 180,
					brightness: 255
				},
			}, {
				effect: "*2",
				prevalence: 3 / 36, //
				on: {
					colour: 240,
					brightness: 150
				},
				off: {
					colour: 240,
					brightness: 255
				},
			}, {
				effect: "/2",
				prevalence: 3 / 36, //
				on: {
					colour: 320,
					brightness: 150
				},
				off: {
					colour: 320,
					brightness: 255
				},
			}]

			effects.forEach((e) => {

				for (let i = 0; i < Math.round(global.grid.length * e.prevalence); i++) {
					if(dummyGrid.length>0) global.grid[dummyGrid.pop()].effect = e;
				}


			})

			console.log("needs something to push tile settings to the grid");


			var sends=[]
			global.grid.forEach(tile=>{

				sends.push("S"+tile.hwAddr+"1"+tile.effect.on.colour.toString().padStart(3,0)+tile.effect.on.brightness.toString().padStart(3,0)+".")
				sends.push("S"+tile.hwAddr+"0"+tile.effect.off.colour.toString().padStart(3,0)+tile.effect.off.brightness.toString().padStart(3,0)+".")

			})
/*
			sends.forEach( (s)=>global.port.write(s)  )
*/

			for(x=0;x<sends.length; x++) {
				setTimeout(function(x){
					console.log(sends[x]+"!");
					global.port.write(sends[x])
				},10*x,x)
			}

			require('child_process').exec("amixer sset PCM mute");

			global.soundActive=false;
			global.currentValue = 0;
			global.targetValue = null;
			global.turns = 0;
			global.turnsBeforeTarget = 15;
			global.players = 0;
			global.won=false;

		}

		r.report = function (message) {

			if(!global.soundActive) {
				global.soundActive=true;
				console.log("turn sound on!");
				require('child_process').exec("amixer sset PCM unmute");
			}

			var hwAddr = parseInt(message.substring(1, 3));
			var status = parseInt(message.substring(3, 4));

			target = global.grid.find(cell => cell.hwAddr == hwAddr)

			target.selected = status == 1

			console.log("Reported:" + message + "("+target._n+" is "+target.selected+")");

			if (target.selected) eval("global.currentValue = global.currentValue " + target.effect.effect)
			if(global.currentValue==global.targetValue) {
				console.log("Game won - need something to trigger cog box release");
				global.won=true;
			};


			if (target.selected) turns++;
			if (global.turns == global.turnsBeforeTarget) global.targetValue = Math.round(Math.random() * 1000);

			global.players = global.players + (target.selected ? 1 : -1);
			if (global.players == 0) r.initialise();

			sails.sockets.blast("update", {
				currentValue: global.currentValue,
				targetValue: global.targetValue,
				turns: global.turns,
				turnsBeforeTarget: global.turnsBeforeTarget,
				won:global.won
			});

		}

		// All done.
		return exits.success(r);

	}


};
