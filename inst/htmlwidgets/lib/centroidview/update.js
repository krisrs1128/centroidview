/**
 * Update an initialized centroidview display
 *
 * author: sankaran.kris@gmail.com
 * date: 08/04/2017
 */

function subtree(hierarchy, query_id) {
  var cur_desc = hierarchy.descendants().map(function(d) { return d.id; });
  if (hierarchy.id == query_id) {
    return hierarchy;
  } else {
    for (var i = 0; i < hierarchy.children.length; i++) {
      var next_desc = hierarchy.children[i].descendants().map(function(d) { return d.id; });
      if (next_desc.indexOf(query_id) != -1) {
        return subtree(hierarchy.children[i], query_id);
      }
    }
  }
}

function update_wrapper(elem, root, d, scales, cur_cluster, n_clusters) {
  var cur_tree = subtree(root, d.data.id);
  update_heatmap_focus(
    d3.select(elem)
      .select("#hm_focus_" + cur_cluster),
    cur_tree,
    scales.tree_y,
    scales.cluster_cols[cur_cluster],
    scales.tile_x
  );
  update_tree_focus(
    elem,
    cur_tree.descendants(),
    cur_cluster,
    n_clusters,
    scales.tree_x,
    scales.tree_y,
    scales.cluster_cols[cur_cluster]
  );
  update_heatmap_cover(
    elem,
    n_clusters
  );
}

function update_heatmap_focus(focus_elem, cur_tree, y_scale, stroke_color,
                              tile_x_scale) {
  var cur_y = cur_tree.leaves()
      .map(function(d) { return d.data.y; });

  var bandwidth = y_scale.range()[1] / (y_scale.domain()[1] - y_scale.domain()[0]);
  var y_extent = d3.extent(cur_y);

  var focus_rect = focus_elem.select("rect");
  var n_rects = focus_rect.nodes().length;
  if (n_rects === 0) {
    focus_elem.append("rect");
  }

  focus_rect = focus_elem.selectAll("rect")
    .transition()
    .duration(500)
    .attrs({
      "class": "hm_focus",
      "y": y_scale(y_extent[0]),
      "x": tile_x_scale.range()[0],
      "height": y_scale(y_extent[1]) - y_scale(y_extent[0]) + bandwidth,
      "width": tile_x_scale.range()[1] - tile_x_scale.range()[0],
      "stroke": stroke_color,
      "stroke-opacity": 0.7,
      "fill": "none"
    });
}

function update_tree_focus(elem, cluster_data, cur_cluster, n_clusters, x_scale,
                           y_scale, fill_color) {
  d3.select(elem)
    .select("#subtree_" + cur_cluster)
    .selectAll(".hcnode")
    .data(cluster_data, id_fun).exit()
    .remove();

  d3.select(elem)
    .select("#subtree_" + cur_cluster)
    .selectAll(".hcnode")
    .data(cluster_data, id_fun).enter()
    .append("circle")
    .attrs({
      "class": "hcnode",
      "r": 2,
      "fill": fill_color,
      "fill-opacity": 0.4,
      "cx": function(d) { return x_scale(d.data.x); },
      "cy": function(d) { return y_scale(d.data.y); }
    });

  var highlight_ids = selected_ids(elem, n_clusters);
  d3.select(elem)
    .select("#subtree_0")
    .selectAll(".hcnode")
    .attrs({
      "fill-opacity": function(d) {
        if (highlight_ids.indexOf(d.id) == -1) {
          return 0.4;
        }
        return 0;
      }
    });
}

function update_heatmap_cover(elem, n_clusters) {
  var highlighted_ids = selected_ids(elem, n_clusters);
  d3.select(elem)
    .select("#tile_cover")
    .selectAll(".tile_cover")
    .attrs({
      "fill-opacity": function(d)  {
        if (highlighted_ids.indexOf(d.column) != -1) {
          return 0;
        }
        return 0.4;
      }
    });
}
