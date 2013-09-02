app.directive 'markdown',
['$interpolate','$compile','$location',
( $interpolate , $compile , $location) ->
  tocCount = 0
  nextToc = () -> "toc_"+(tocCount = tocCount + 1)
  converter = new Showdown.converter #({extensions: ['prettify']})
  markdownDirective =
    restrict: 'E'
    link: (scope, element, attrs) ->
      build = (text) ->
        text ?= ""
        markdownText = $interpolate(text)(scope)
        htmlText = converter.makeHtml markdownText
        eText = document.createElement 'div'
        eText.innerHTML = htmlText
        #eToc = document.createElement 'div'
        #eToc.className = 'toc'

        # Find and update external links
        for e in eText.querySelectorAll "a[href^='http']"
          e.setAttribute('target','_blank')
        # Find and process prettyprint codes
        for e in eText.querySelectorAll "pre>code"
          eCode = e; ePre = eCode.parentNode
          text = eCode.textContent
          if (text.slice(0,3) == ":::")
            eol = text.indexOf "\n"
            lang = text.slice 3, eol
            text = text.slice eol + 1
          eDiv = document.createElement 'div'
          eDiv.innerHTML = prettyPrintOne(
            "<pre class='prettify'>"+
              "<code class='language-#{lang}'>"+
                "#{text}"+
              "</code>"+
            "</pre>"
          , lang)
          ePre.parentNode.replaceChild eDiv, ePre

        element.html eText.innerHTML
        $compile(element.contents())(scope)

      if attrs.text
        scope.$watch attrs.text, (value) ->
          build value
      else
        build element.text()

]
###
#      # Build indexes
#      count = 0
#      for e in eText.querySelectorAll "h2,h3,hr"
#        eThis = e
#        eLi = document.createElement "li"
#        switch eThis.tagName
#          when "HR"
#            eLi.className = 'divider'
#          when "H2"
#            eLi.className = 'nav-header'
#            eLi.textContent = eThis.textContent
#          when "H3"
#            count = count + 1
#            id = eThis.attr 'id'
#            eLink = document.createElement "a"
#            eLink.setAttribute 'href', '#'#+$location.path()+'#'+id
#            eLink.setAttribute "ng-click", "scrollTo('#{id}',$event)"
#            eLink.textContent = eThis.textContent
#            eLi.appendChild eLink
#          else console.log "ERRR:!!: '#{tagName}'"
#        eToc.appendChild eLi
#
#      element.innerHTML = if count > 2 or attrs.toc == "right"
#        tocHtml = "<div class='well' style='padding: 8px 0;'
#                   ><ul class='nav nav-list'>#{eToc.innerHTML}</ul></div>"
#        if attrs.toc == 'top'
#          "#{tocHtml}<div>#{eText.innerHTML}</div>"
#        else "
#<div class='row-fluid'>
#  <div class='span4'>#{tocHtml}</div>
#  <div class='span8'
#      >#{eText.innerHTML}</div>
#</div>"
#      else eText.innerHTML
#      $compile(element.contents())(scope)
###
