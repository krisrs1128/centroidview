/**
 * Visualization of hierarchical clustering centroids
 *
 * author: sankaran.kris@gmail./*
 * date: 08/04/2017
 */

// some global variables
function prepare_globals(tree) {
  console.log(tree)
  var root = d3.stratify()
      .id(function(d) { return d.id; })
      .parentId(function(d) { return d.parent; })(tree);
  return root;
}
