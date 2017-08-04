HTMLWidgets.widget({

  name: 'centroidview',
  type: 'output',

  factory: function(el, width, height) {
    return {

      renderValue: function(x) {
        console.log(x.melted_data)
        centroidview(
          el,
          HTMLWidgets.dataframeToD3(x.phy_df),
          HTMLWidgets.dataframeToD3(x.melted_data)
        );
      },

      resize: function(width, height) {}
    };
  }
});
