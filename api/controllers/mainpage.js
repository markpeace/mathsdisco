module.exports = {


  friendlyName: 'Mainpage',


  description: 'Mainpage something.',


  inputs: {

  },


  exits: {
    success: {
      responseType: 'view',
      viewTemplatePath: 'pages/mainpage'
    },
  },


  fn: function(inputs, exits) {

    return exits.success({global:global});

  }


};
