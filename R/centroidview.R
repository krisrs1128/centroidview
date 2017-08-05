#' Study Centroids from a Hierarchical Clustering
#'
#' This creates an interactive heatmap + hierarchical clustering view.
#'
#' @import htmlwidgets
#' @importFrom dplyr rename mutate
#' @importFrom tibble data_frame as_data_frame
#' @importFrom plyr dlply .
#'
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
