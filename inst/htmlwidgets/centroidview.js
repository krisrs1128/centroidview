HTMLWidgets.widget({

  name: 'centroidview',
  type: 'output',

  factory: function(el, width, height) {
    return {

      renderValue: function(x) {
        var ts_data = {};
        for (var i = 0; i < x.melted_data.length; i++) {
          var cur_ix = x.melted_data[i].column + "_" + x.melted_data[i].facet;
          if (typeof(ts_data[cur_ix]) === "undefined") {
            ts_data[cur_ix] = [x.melted_data[i]];
          } else {
            ts_data[cur_ix].push(x.melted_data[i]);
          }
        }
        ts_data = Object.keys(ts_data).map(function (key) { return ts_data[key]; });

        centroidview(
          el,
          x.phy_df,
          x.melted_data,
          ts_data,
          width,
          height
        );
      },

      resize: function(width, height) {}
    };
  }
});
