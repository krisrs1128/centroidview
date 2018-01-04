#' Study Centroids from a Hierarchical Clustering
#'
#' This creates an interactive heatmap + hierarchical clustering view.
#'
#' @import htmlwidgets
#' @importFrom dplyr rename mutate
#' @importFrom tibble data_frame as_data_frame
#' @importFrom plyr dlply .
#' @importFrom tidyr gather
#'
#' @examples
#' library("ape")
#' library("tibble")
#' library("dplyr")
#' library("tidyr")
#'
#' # simulate random matrix
#' n <- 100
#' p <- 10
#' x <- matrix(rnorm(n * p), n, p)
#' hc <- hclust(dist(x))
#'
#' facet_x <- c(1:(p/2), 1:(p/2))
#' group <- sample(LETTERS[1:4], n, replace = TRUE)
#' facet <- c(rep("1", p/2), rep("2", p/2))
#'
#' ## prepare the tree coordinates data
#' phy <- as.phylo(hc)
#' plot(phy)
#' plot_info <- get("last_plot.phylo", envir = .PlotPhyloEnv)
#' phy_df <- data_frame(
#'   column = as.character(seq_along(plot_info$yy)),
#'   x = plot_info$xx,
#'   y = plot_info$yy
#' )
#'
#' # prepare centroidview input data
#' phy_df <- as_data_frame(phy$edge) %>%
#'   rename(parent = V1, column = V2) %>%
#'   mutate_all(as.character) %>%
#'   left_join(phy_df)
#' tmp_root <- data_frame(
#'   parent = "",
#'   column = as.character(phy$edge[1, 1]),
#'   x = 0.0,
#'   y = mean(phy_df$y)
#' )
#' phy_df <- rbind(phy_df, tmp_root)
#'
#' centroidview(x, phy_df, group, facet, facet_x)
#' @export
centroidview <- function(x,
                         phy_df,
                         group,
                         facet,
                         facet_x,
                         width = NULL,
                         height = NULL,
                         elementId = NULL) {
  ## prepare the melted value data
  mx <- data.frame("column" = as.character(seq_len(nrow(x))), "x" = x, stringsAsFactors = FALSE) %>%
    gather(row, value, -column) %>%
    mutate(
      row = gsub("x\\.", "", row),
      group = group[as.integer(column)],
      facet = facet[as.integer(row)],
      facet_x = facet_x[as.integer(row)]
    ) %>%
    as_data_frame()

  melted_data <- mx %>%
    left_join(phy_df %>% select(-x, -parent))

  ## construct the ts_data
  ts_data <- melted_data %>%
    dlply(.(facet, column, group), identity)
  names(ts_data) <- NULL

  ## forward options using x
  fw <- list(
    "phy_df" = phy_df,
    "melted_data" = melted_data,
    "ts_data" = ts_data
  )

  ## create widget
  attr(fw, 'TOJSON_ARGS') <- list(
    dataframe = "rows",
    auto_unbox = FALSE,
    force = FALSE
  )

  htmlwidgets::createWidget(
    name = 'centroidview',
    x = fw,
    width = width,
    height = height,
    package = 'centroidview',
    elementId = elementId
  )
}
