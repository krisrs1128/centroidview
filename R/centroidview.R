#' Study Centroids from a Hierarchical Clustering
#'
#' This creates an interactive heatmap + hierarchical clustering view.
#'
#' @import htmlwidgets
#' @importFrom dplyr rename mutate
#' @importFrom tibble data_frame as_data_frame
#' @importFrom dendextend as.phylo.dendrogram
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

  plot_info <- phy_plot_data(phy)
  node_data <- data_frame(
    column = as.character(seq_along(plot_info$xx)),
    x = plot_info$xx,
    y = plot_info$yy
  )

  phy_df <- as_data_frame(phy$edge) %>%
    rename(parent = V1, column = V2) %>%
    mutate_all(as.character) %>%
    left_join(node_data)

  tmp_root <- data_frame(
    parent = "",
    column = as.character(phy$edge[1, 1]),
    x = 0.0,
    y = mean(phy_df$y)
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

phy_plot_data <- function(phy) {
  ff <- tempfile()
  png(filename=ff)
  plot(phy)
  dev.off()
  unlink(ff)
  get("last_plot.phylo", envir = .PlotPhyloEnv)
}
