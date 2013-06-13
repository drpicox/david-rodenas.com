# First Sentence Filter
# =======================
# Converts a large text a just the first sentence
# (a sentence that ends with '.'): How it works:
#
# "An example" -> "An example."
# "A large example. Other example." -> "A large example."
# "A 2.0 example. And more." -> "A 2."
# 2 -> "2."
# undefined -> ""
# null -> ""
# true -> "true."

angular.module('PolarisApp').filter 'firstSentence', () ->
  (input, scope) ->
    if input?
      input.toString().split(".")[0] + "."
    else ""
