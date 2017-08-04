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
  tree_voronoi(elem, display.root, scales.tree_x, scales.tree_y, scales.tile_x,
               param.margin, true);

  // draw the heatmap
  draw_heatmap(elem, data, scales.tree_y, scales.tile_x, scales.tile_fill);
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

function draw_tree(elem, root, tree_x_scale, tree_y_scale) {
  // draw nodes
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

  // draw links
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

function tree_voronoi(elem, root, tree_x_scale, tree_y_scale, tile_x_scale,
                      margin, responsive) {

  // Define voronoi polygons for the tree nodes
  var voronoi = d3.voronoi()
      .x(function(d) { return tree_x_scale(d.data.x); })
      .y(function(d) { return tree_y_scale(d.data.y); })
      .extent([
        [0, 0],
        [tile_x_scale.range()[0], tree_y_scale.range()[1]]
      ]);

  d3.select(elem)
    .select("#voronoi")
    .selectAll(".voronoi")
    .data(voronoi(root.descendants()).polygons()).enter()
    .append("path")
    .attrs({
      "id": function(d) { return d.data.id; },
      "d": function(d) { return "M" + d.join("L") + "Z"; },
      "class": "voronoi",
      "fill": "none",
      "pointer-events": "all"
    })
    .on("mouseover", function(d) {
      if (responsive) {
        console.log("mouseover")
        // update_wrapper(d);
      }
    });
}

function draw_heatmap(elem, data, tree_y_scale, tile_x_scale, tile_fill_scale) {
  // Draw the heatmap
  var bandwidth = tree_y_scale.range()[1] / (tree_y_scale.domain()[1] - tree_y_scale.domain()[0]);
  d3.select(elem)
    .select("#tiles")
    .selectAll(".tile")
    .data(data, tile_id_fun).enter()
    .append("rect")
    .attrs({
      "class": "tile",
      "x": function(d) { return tile_x_scale(d.row); },
      "y": function(d) {return tree_y_scale(d.column);},
      "width": tile_x_scale.bandwidth(),
      "height": bandwidth,
      "fill": function(d) { return tile_fill_scale(d.value); }
    });

  // Draw shades / covers on the heatmap
  var init_level = data[0].row;
  d3.select(elem)
    .select("#tile_cover")
    .selectAll(".tile_cover")
    .data(data.filter(function(d) { return d.row == init_level;}), function(d) { return d.x; }).enter()
    .append("rect")
    .attrs({
      "class": "tile_cover",
      "y": function(d) { return tree_y_scale(d.column); },
      "height": bandwidth,
      "x": tile_x_scale.range()[0],
      "width": tile_x_scale.range()[1] - tile_x_scale.range()[0],
      "fill-opacity": 0
    });
}
