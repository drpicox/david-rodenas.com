app.filter 'documentFilter', () ->
  (docs, query) ->

    # Search functions
    filterSearch = (doc, query) ->
      return true if not query
      filterOrSearch doc, query
    filterOrSearch = (doc, query) ->
      for q in query.split "|"
        return true if filterAndSearch doc, q
      false
    filterAndSearch = (doc, query) ->
      q = query.toLowerCase().match(/[^\s]+/g) or []
      for k in q
        return false if not doc._search[k]
      true
        
    (doc for doc in docs when filterSearch doc, query)