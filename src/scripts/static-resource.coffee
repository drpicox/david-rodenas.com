# StaticResource
# ==============
#
# It represents a data resource that is managed statically.
#
# The API
# -------
# Create an instance:
#     MyResource = StaticResource({name: 'my-resource'})
#
# Get a promise object for the list of all the objects:
#     resources = MyResource.asyncQuery()
#
# Get a promise of a determined document properties
#     resources = MyResource.asyncGet(basename)
#
# Get a promise of the markdown content of the document
#     resources = MyResource.asyncContent(basename)
#
# Get a promise for an associate map of tags and their weights
#     resources = MyResource.asyncTags()
#
# Get a promise for an ordered list of related dotucments to the baseone
#     resources = MyResource.asyncRelated(basename)
#
# Helper function to filter search
#     MyResource.filterSearch
#
# Static Data format
# ------------------
# It expects to have a directory like this:
#
#     data/#{name}.json
#     data/#{name}/<document1>.md
#     data/#{name}/<document2>.md
#     ...
#     data/#{name}/<documentN>.md
#
# Each <document>.md is a markdown document that contains a header
# with a YAML of its metadata like:
#     ---
#       metadata: 'value'
#     ---
#     This is the _regular_ text.
#
# #{name}.json contains a object indexing
# all documents and their metadata.
#
app.factory 'StaticResource',
['$http','$q',
( $http,  $q) ->

  StaticResourceFactory = (options) ->
    throw new Error("options undefined") if not options?
    throw new Error("options.name undefined") if not options.name

    # A cache for docs
    docsDefer = $q.defer()
    docing = docsDefer.promise
    
    asyncContent = (arg) ->
      basename = if angular.isString arg then arg else arg.basename
      file = "data/#{options.name}/#{basename}.md"
      contentDefer = $q.defer()
      $http.get(file)
      .success (content) ->
        contentDefer.resolve content.slice 5+content.search(/\n---\n/)
      .error (e) ->
        contentDefer.reject e
      contentDefer.promise

    # Preprocess all docs to ease its representation
    preprocessDocs = (docs) ->
      for k,doc of docs
        doc.preview = doc.abstract if doc.abstract?
        doc.preview = doc.preview.replace /\n/g, ' '
        doc.tags ?= []
        doc.relevance ?= 1
        # Generate the search keys
        doc._search = {}
        doc._search["basename:#{k}"] = true
        texts = JSON.stringify(doc).toLowerCase().match(/\w+/g) or []
        for text in texts
          for i in [1..text.length]
            doc._search[text.slice(0, i)] = true
        for tag in doc.tags
          doc._search["tag:#{tag.toLowerCase()}"] = true
        # Generate the tag set
        doc._tagSet = {}
        for tag in doc.tags
          doc._tagSet[tag] = true
        doc._asyncContent = () ->
          asyncContent this.basename
          
    # A list of all docs
    listing = docing.then (docs) ->
      (doc for k,doc of docs).sort (a,b) -> b.relevance - a.relevance
    
    # A list of tags
    tagging = listing.then (list) ->
        tagHash = {}
        for doc in list
          for tag in doc.tags
            tagHash[tag] = true
        tags = (tag for tag,val of tagHash)
        tags
        
    # A hash of tags weighted
    tagClouding = listing.then (list) ->
        tagCloud = {}
        for doc in list
          for tag in doc.tags
            tagCloud[tag] = (tagCloud[tag] or 0) + doc.relevance
        max = Math.max (m for tag,m of tagCloud)...
        min = Math.min (m for tag,m of tagCloud)...
        max = max + 1 if max == min
        for tag,m of tagCloud
          tagCloud[tag] = (m - min) / (max - min)
        tagCloud
                
    # Get all docs
    $http.get("data/#{options.name}.json")
    .success (docs) ->
      preprocessDocs docs
      docsDefer.resolve docs
    .error (e) ->
      docsDefer.reject e

    
    # Compute the distance of relevance of two documents
    distances = {} # with result cache
    distance = (a, b) ->
      [a, b] = [b, a] if a.basename > b.basename
      return distances[k] if distances[k = "#{a.basename}/#{b.basename}"]
      d = a.relevance + b.relevance
      d = d + 1 for tag in a.tags when b._tagSet[tag]
      d = d - 1 for tag in a.tags when !b._tagSet[tag]
      d = d - 1 for tag in b.tags when !a._tagSet[tag]
      console.log "=== DISTANCE"
      console.log a.title + " <-> " + b.title
      console.log "distance:"+ d
      distances[k] = -d

    
#    this.filterSearch = (doc, query) ->
#      return true if not query
#      q = query.toLowerCase().match(/[^\s]+/g) or []
#      for k in q
#        return false if not doc._search[k]
#      true
        
    Resource =
      asyncQuery : () -> listing
      asyncGet : (basename) -> docing.then (docs) -> docs[basename]
      asyncTags : () -> tagging
      asyncTagCloud : () -> tagClouding
      asyncRelated : (basename) -> docing.then (docs) ->
        if not docs[basename]
          throw new Error("resource '#{options.name}/#{basename}' not found")
        return c._related if (c = docs[basename])._related
        related = (doc for k,doc of docs when k != basename)
        related.sort (a,b) -> distance(a,c) - distance(b,c)
        c._related = related

        
]
