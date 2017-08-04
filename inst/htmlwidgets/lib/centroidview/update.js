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

function update_wrapper(elem, root, d, scales) {
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
    d3.select(elem),
    cur_tree.descendants(),
    cur_cluster,
    opts.n_clusters,
    scales.tree_x,
    scales.tree_y,
    scales.cluster_cols[cur_cluster]
  );
  update_heatmap(
    d3.select(elem),
    opts.n_clusters
  );
}
