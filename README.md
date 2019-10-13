# centroidview

This is an R package to study the centroids associated with a hierarchical
clustering. To install, run

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
Rstudio, will appear in the plotting region. Click to free the view, double
click to introduce new clusters, and scroll to cycle through the clusters on the
screen. An example application of this package to real microbiome data is
available at `http://statweb.stanford.edu/~kriss1/centroidview.html`.

<img width=500 src="https://drive.google.com/uc?id=13PO4zkSHQThHYfvFfaJps54FQ0pDULVo"/>

We know that the method of extracing tree coordinates in that example is 
not very elegant. In the future, we will provide helpers for constructing this
type of input to the function.
