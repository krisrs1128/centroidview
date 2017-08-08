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

function tile_id_fun(d) {
  return d.column + "-" + d.row;
}

function ts_id_fun(d) {
  return d[0].column;
}

// ids selected by any cluster
function selected_ids(elem, n_clusters) {
  var cur_labels = [];
  for (var k = 1; k <= n_clusters; k++) {
    cur_labels = cur_labels.concat(
      d3.select(elem)
        .select("#subtree_" + k)
        .selectAll(".hcnode")
        .data().map(id_fun)
    );
  }
  return cur_labels;
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

function elemwise_mean(x_array, facets, facets_x) {
  var means = [];
  for (var j = 0; j < facets.length; j++) {
    var array_sub = x_array.filter(function(d) {
      return parseFloat(d[0].facet) == facets[j];
    });

    var facet_mean = [];
    for (var t = 0; t < array_sub[0].length; t++) {
      facet_mean.push(
        {
          "facet": facets[j],
          "facet_x": array_sub[0][t].facet_x,
          "value": d3.mean(array_sub.map(function(x) { return x[t].value; }))
        }
      );
    }
    means.push(facet_mean);
  }

  return means;
}

function scales_dictionary(tree, data, param) {
  var coords = {
    "x": tree.map(function(d) { return d.x; }),
    "y": tree.map(function(d) { return d.y; })
  };
  var facets = extract_unique(data, "facet");
  var groups = extract_unique(data, "group");
  var fill_vals = data.map(function(d) { return d.value; });
  var facet_x = extract_unique(data, "facet_x").map(parseFloat);

  return {
    "tile_x": d3.scaleBand()
      .domain(extract_unique(data, "row"))
      .range([10 + param.tree_x_prop * param.elem_width, (1 - param.facet_x_prop) * param.elem_width]),
    "tile_fill": d3.scaleLinear()
      .domain(d3.extent(fill_vals))
      .range(["#f8f8f8", "black"]),
    "tree_x": d3.scaleLinear()
      .domain(d3.extent(coords.x))
      .range([0, param.tree_x_prop * param.elem_width]),
    "tree_y": d3.scaleLinear()
      .domain(d3.extent(coords.y))
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
