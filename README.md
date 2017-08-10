# centroidview

This is an R package to study the centroids associated with a hierarchical
clustering. To install, used

```
library("devtools")
install_github("krisrs1128/centroidview")
```

and then to see an example application, use

```
library("centroidview")
example(centroidview)
```

The interactive display will either open a new browser or, if you're using
Rstudio, will appear in the plotting region.

We know that the method of extracing tree coordinates in that example is 
not very elegant. In the future, we will provide helpers for constructing this
type of input to the function.
