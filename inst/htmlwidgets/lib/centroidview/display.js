/**
 * Visualization of hierarchical clustering centroids
 *
 * author: sankaran.kris@gmail./*
 * date: 08/04/2017
 */

function centroidview(elem, tree) {
  var param = parameter_defaults({});
  tree = HTMLWidgets.dataframeToD3(tree);
  var display_opts = display_defaults(tree);
  setup(elem, param);
}

function setup(elem, param) {
  // create margins using margin convention
  // https://bl.ocks.org/mbostock/3019563
  var margin = {top: 20, right: 10, bottom: 20, left: 10};
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
    })
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}
