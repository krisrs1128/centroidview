/**
 * Visualization of hierarchical clustering centroids
 *
 * author: sankaran.kris@gmail./*
 * date: 08/04/2017
 */

function centroidview(elem, tree, data) {
  var param = parameter_defaults({});
  var display = display_defaults(tree);

  // setup background display elements
  setup(elem, param);
  add_groups(elem, param);
  param.elem_width = param.elem_width - param.margin.right - param.margin.left;
  param.elem_height = param.elem_height - param.margin.top - param.margin.bottom;

  // get some of the scales
  var scales = scales_dictionary(tree, data, param);
  var facet_x = extract_unique(data, "facet_x");

  // Draw the tree
  draw_tree(elem, display.root, scales.tree_x, scales.tree_y);

}

function draw_tree(elem, root, tree_x_scale, tree_y_scale) {
  d3.cluster()(root);
  d3.select(elem)
    .select("#subtree_0")
    .selectAll(".hcnode")
    .data(root.descendants(), id_fun).enter()
    .append("circle")
    .attrs({
      "class": "hcnode",
      "r": 2,
      "fill": "#555",
      "fill-opacity": 0.4,
      "cx": function(d) { return tree_x_scale(d.data.x); },
      "cy": function(d) { return tree_y_scale(d.data.y); }
    });

  var link_fun = d3.linkHorizontal()
      .x(function(d) { return tree_x_scale(d.data.x); })
      .y(function(d) { return tree_y_scale(d.data.y); });

  d3.select(elem)
    .select("#links")
    .selectAll(".link")
    .data(root.links()).enter()
    .append("path")
    .attrs({
      "class": "link",
      "stroke": "#555",
      "d": link_fun
    });
}

function setup(elem, param) {
  // create margins using margin convention
  // https://bl.ocks.org/mbostock/3019563
  var svg_elem = d3.select(elem)
      .append("svg")
      .attrs({
        "width": param.elem_width,
        "height": param.elem_height
      });

  svg_elem.append("rect")
    .attrs({
      "fill": "#F8F8F8",
      "width": param.elem_width,
      "height": param.elem_height
    });

  svg_elem.append("g")
    .attrs({
      "transform": "translate(" + param.margin.left + "," + param.margin.top + ")",
      "id": "base"
    });
}

function add_groups(elem, param) {
  // layer 0 represents all samples / features, and is always on top (even if
  // invisible)
  var group_labels = ["tiles", "tile_cover", "links", "voronoi", "group_histo",
                      "histo_axis"];
  for (var k = param.n_clusters; k >= 0; k--) {
    group_labels = group_labels.concat([
      "subtree_" + k,
      "hm_focus_" + k,
      "time_series_" + k,
      "centroids_" + k
    ]);
  }

  d3.select(elem)
    .select("#base")
    .selectAll("g")
    .data(group_labels).enter()
    .append("g")
    .attr("id", function(d) { return d; });
}
