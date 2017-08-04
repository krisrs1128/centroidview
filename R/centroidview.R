#' Study Centroids from a Hierarchical Clustering
#'
#' This creates an interactive heatmap + hierarchical clustering view.
#'
#' @import htmlwidgets
#' @importFrom dplyr rename mutate
#' @importFrom tibble data_frame as_data_frame
#' @importFrom dendextend as.phylo.dendrogram get_nodes_xy
#' @importFrom ape as.phylo
#'
#' @export
centroidview <- function(x, tree, groups, samples, width = NULL, height = NULL,
                         elementId = NULL) {
  ## prepare the tree coordinates data
  dendro <- reorder(as.dendrogram(tree), -colMeans(x))
  phy <- as.phylo(dendro)

  node_data <- get_nodes_xy(dendro) %>%
    as_data_frame() %>%
    rename(y = V1, x = V2) %>%
    mutate(x = -x)
  node_data$id <- seq_along(node_data$y)

  phy_df <- as_data_frame(phy$edge) %>%
    rename(parent = V1, id = V2) %>%
    left_join(node_data)
  mapping <- setNames(phy$tip, seq_along(phy$tip))
  phy_df <- rbind(
    phy_df,
    data_frame(parent = "", id = phy$edge[1, 1], y = 0.03, x = mean(phy_df$x))
  )

  # forward options using x
  fw = list(
    "phy_df" = phy_df
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'centroidview',
    fw,
    width = width,
    height = height,
    package = 'centroidview',
    elementId = elementId
  )
}
