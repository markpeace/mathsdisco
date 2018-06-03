module.exports = {


  friendlyName: 'Trigger',


  description: 'Trigger something.',


  inputs: {
    onTile: {
      description: 'The ID of the tile to trigger.',
      type: 'number',
      required: false
    },
    offTile: {
      description: 'The tile which has been left.',
      type: 'number',
      required: false
    }

  },


  exits: {
    success: {
      responseType: 'view',
      viewTemplatePath: 'pages/trigger'
    },

  },


  fn: function(inputs, exits) {

    sails.helpers.grid().then((grid) => {
      if (process.env.C9_PID) {
        //if (inputs.onTile) global.port.writeToComputer("R" + global.grid[inputs.onTile].hwAddr + "1.");
        //if (inputs.offTile) global.port.writeToComputer("R" + global.grid[inputs.offTile].hwAddr + "0.");
      }
      else {
        //if (inputs.onTile) grid.report("R" + global.grid[inputs.onTile].hwAddr + "1.")
        //if (inputs.offTile) grid.report("R" + global.grid[inputs.offTile].hwAddr + "0.")
		 if (inputs.onTile) global.port.write("R" + global.grid[inputs.onTile].hwAddr + "1.");
		 if (inputs.offTile) global.port.write("R" + global.grid[inputs.offTile].hwAddr + "0.");
 	  	global.port.write("CMD1.CMD2.");
	  }
      return exits.success({ grid: global.grid, onTile: inputs.onTile, currentValue: global.currentValue, targetValue: global.targetValue });
    });

  }


};
