HTMLWidgets.widget({

  name: 'centroidview',
  type: 'output',

  factory: function(el, width, height) {
    return {

      renderValue: function(x) {
        centroidview(el, x.phy_df);
      },

      resize: function(width, height) {}
    };
  }
});
