/**
 * Update an initialized centroidview display
 *
 * author: sankaran.kris@gmail.com
 * date: 08/08/2017
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

function update_wrapper(elem,
                        root,
                        data,
                        ts_data,
                        d,
                        scales,
                        histo_axis,
                        cur_cluster,
                        n_clusters,
                        facet_x) {
  var cur_tree = subtree(root, d.data.id);
  var line = d3.line()
      .x(function(d) {
        return scales.centroid_x(d.facet_x);
      })
    .y(function(d) {
      return scales.facet_offset(d.facet) + scales.centroid_y(d.value);
    });

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
  update_ts_focus(
    elem,
    ts_data,
    line,
    selected_ids(elem, n_clusters),
    cur_cluster,
    scales.cluster_cols[cur_cluster],
    scales.facet_offset.domain(),
    facet_x
  );
  update_histo(
    elem,
    data,
    scales,
    n_clusters,
    histo_axis
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

function update_ts_focus(elem,
                         ts_data,
                         line,
                         cur_ids,
                         cur_cluster,
                         stroke_color,
                         facets,
                         facet_x) {
  var cluster_data = ts_data.filter(function(d) {
    return cur_ids.indexOf(d[0].column) != -1;
  });
  d3.select(elem)
    .select("#time_series_" + cur_cluster)
    .selectAll(".highlighted_series")
    .data(cluster_data, ts_id_fun).exit()
    .remove();

  d3.select(elem)
    .select("#time_series_" + cur_cluster)
    .selectAll(".highlighted_series")
    .data(cluster_data, ts_id_fun).enter()
    .append("path")
    .attrs({
      "class": "highlighted_series",
      "stroke": stroke_color,
      "d": line
    });

  var means = elemwise_mean(cluster_data, facets, facet_x);
  d3.select(elem)
    .select("#centroids_" + cur_cluster)
    .selectAll(".centroid")
    .data(means).enter()
    .append("path")
    .attrs({
      "stroke": stroke_color,
      "class": "centroid",
      "d": line
    });

  d3.select(elem)
    .select("#centroids_" + cur_cluster)
    .selectAll(".centroid")
    .transition()
    .duration(700)
    .attrs({
      "stroke": stroke_color,
      "class": "centroid",
      "d": line
    });
}

function update_histo(elem, data, scales, n_clusters, histo_axis) {
  // reset scales
  var counts = group_array(elem, data, n_clusters);
  scales.histo_x.domain(
    [0, d3.max(counts.map(function(d) { return d.count; }))]
  );

  d3.select(elem)
    .transition()
    .duration(700)
    .select("#histo_axis")
    .call(histo_axis.scale(scales.histo_x));

  d3.select(elem)
    .select("#group_histo")
    .selectAll(".histo_bar")
    .data(counts, function(d) { return d.cluster + d.group; }).enter()
    .append("rect")
    .attrs({
     "class": "histo_bar",
      "x": scales.centroid_x.range()[0],
      "width": 0,
      "y": function(d) {return scales.histo_group(d.group) + scales.histo_offset(d.cluster);},
      "height": scales.histo_offset.step(),
      "fill": function(d) { return scales.cluster_cols[d.cluster]; }
    });

  d3.select(elem)
    .select("#group_histo")
    .selectAll(".histo_bar")
    .data(counts, function(d) { return d.cluster + d.group; }).exit()
    .attrs({"width": 0})
    .remove();

  d3.select(elem)
    .select("#group_histo")
    .selectAll(".histo_bar")
    .transition()
    .duration(700)
    .attrs({
      "width": function(d) { return scales.histo_x(d.count); },
      "y": function(d) {return scales.histo_group(d.group) + scales.histo_offset(d.cluster);},
      "height": scales.histo_offset.step()
    });
}
