/**
 * Functions for creating and modifying data
 *
 * author: sankaran.kris@gmail.com
 * date: 08/04/2017
 */

function parameter_defaults(opts) {
  var default_opts = {
    "n_clusters": 3,
    "elem_height": 950,
    "elem_width": 850,
    "tree_y_prop": 1,
    "tree_x_prop": 0.1,
    "facet_x_prop": 0.35,
    "facet_y_prop": 0.55
  };

  var keys = Object.keys(default_opts);
  for (var i = 0; i < keys.length; i++) {
    if (Object.keys(opts).indexOf(keys[i]) == -1) {
      opts[keys[i]] = default_opts[keys[i]];
    }
  }
  return opts;
}

// some display options
function display_defaults(tree) {
  var root = d3.stratify()
      .id(function(d) { return d.column; })
      .parentId(function(d) { return d.parent; })(tree);

  return {
    "root": root,
    "responsive": true,
    "cur_cluster": 1,
    "max_cluster": 1
  };
}
