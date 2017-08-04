#' Study Centroids from a Hierarchical Clustering
#'
#' This creates an interactive heatmap + hierarchical clustering view.
#'
#' @import htmlwidgets
#' @importFrom dplyr rename mutate
#' @importFrom tibble data_frame as_data_frame
#' @importFrom dendextend as.phylo.dendrogram get_nodes_xy
#' @importFrom ape as.phylo
#' @importFrom plyr dlply .
#'
#' @export
centroidview <- function(x,
                         tree,
                         group,
                         facet,
                         facet_x,
                         width = NULL,
                         height = NULL,
                         elementId = NULL) {

  ## prepare the tree coordinates data
  dendro <- reorder(as.dendrogram(tree), -colMeans(x))
  phy <- as.phylo(dendro)

  node_data <- get_nodes_xy(dendro) %>%
    as_data_frame() %>%
    rename(y = V1, x = V2) %>%
    mutate(x = -x)
  node_data$column <- node_data$y %>%
    seq_along() %>%
    as.character()

  phy_df <- as_data_frame(phy$edge) %>%
    rename(parent = V1, column = V2) %>%
    mutate_all(as.character) %>%
    left_join(node_data)

  tmp_root <- data_frame(
    parent = "",
    column = as.character(phy$edge[1, 1]), y = 0.03,
    x = mean(phy_df$x)
  )
  phy_df <- rbind(phy_df, tmp_root)

  ## prepare the melted value data
  mx <- data.frame("row" = seq_len(nrow(x)), "x" = x) %>%
    gather(column, value, -row) %>%
    mutate(
      column = gsub("x\\.", "", column),
      group = group[column],
      facet = facet[row],
      facet_x = facet_x[row]
    ) %>%
    as_data_frame()

  melted_data <- mx %>%
    left_join(phy_df %>% select(-y, -parent))

  ## construct the ts_data
  ts_data <- melted_data %>%
    dlply(.(facet, column, group), identity)
  names(ts_data) <- NULL

  ## forward options using x
  fw = list(
    "phy_df" = phy_df,
    "melted_data" = melted_data,
    "ts_data" = ts_data
  )

  ## create widget
  htmlwidgets::createWidget(
    name = 'centroidview',
    fw,
    width = width,
    height = height,
    package = 'centroidview',
    elementId = elementId
  )
}
