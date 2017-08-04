/**
 * Functions for creating and modifying data
 *
 * author: sankaran.kris@gmail.com
 * date: 08/04/2017
 */

function extract_unique(x, key) {
  var u = x.map(function(d) { return d[key]; });
  return d3.set(u).values();
}

function id_fun(d) {
  return d.id;
}

function parameter_defaults(opts) {
  var default_opts = {
    "n_clusters": 3,
    "elem_height": 950,
    "elem_width": 850,
    "tree_y_prop": 1,
    "tree_x_prop": 0.1,
    "facet_x_prop": 0.35,
    "facet_y_prop": 0.55,
    "margin": {top: 20, right: 10, bottom: 20, left: 10}
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

function scales_dictionary(tree, data, param) {
  console.log(tree);
  var coords = {
    "x": tree.map(function(d) { return d.x; }),
    "y": tree.map(function(d) { return d.y; })
  };
  var facets = extract_unique(data, "facet");
  var groups = extract_unique(data, "group");
  var fill_vals = data.map(function(d) { return d.value; });
  var facet_x = extract_unique(data, "facet_x").map(parseFloat);
  console.log(coords);

  return {
    "tile_x": d3.scaleBand()
      .domain(extract_unique(data, "row"))
      .range([10 + param.tree_x_prop * param.elem_width, (1 - param.facet_x_prop) * param.elem_width]),
    "tile_fill": d3.scaleLinear()
      .domain(d3.extent(fill_vals))
      .range(["#f8f8f8", "black"]),
    "tree_x": d3.scaleLinear()
      .domain(d3.extent(coords.y))
      .range([param.tree_x_prop * param.elem_width, 0]),
    "tree_y": d3.scaleLinear()
      .domain(d3.extent(coords.x))
      .range([0, param.tree_y_prop * param.elem_height]),
    "centroid_x": d3.scaleLinear()
      .domain(d3.extent(facet_x))
      .range([30 + (1 - param.facet_x_prop) * param.elem_width, param.elem_width]),
    "centroid_y": d3.scaleLinear()
      .domain(d3.extent(fill_vals))
      .range([param.facet_y_prop * param.elem_height / facets.length - 10, 0]),
    "cluster_cols": ["#555", '#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854'],
    "facet_offset": d3.scaleBand()
      .domain(facets)
      .range([0, param.facet_y_prop * param.elem_height]),
    "histo_x": d3.scaleLinear()
      .domain([0, 100])
      .range([0, 0.50 * param.facet_x_prop * param.elem_width]),
    "histo_group": d3.scaleBand()
      .domain(groups)
      .range([30 + param.facet_y_prop * param.elem_height, param.elem_height]),
    "histo_offset": d3.scaleBand()
      .domain([1, 2])
      .range([0, (param.facet_y_prop * param.elem_height - 30) / groups.length])
  };

}
