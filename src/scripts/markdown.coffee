angular.module('PolarisApp').directive 'markdown',
['$interpolate','$compile','$location', ($interpolate,$compile,$location) ->
  tocCount = 0
  nextToc = () -> "toc_"+(tocCount = tocCount + 1)
  converter = new Showdown.converter #({extensions: ['prettify']})
  markdownDirective =
    restrict: 'E'
    link: (scope, element, attrs) ->
      markdownText = $interpolate(element.text())(scope)
      htmlText = converter.makeHtml markdownText
      eText = $("<div/>").html htmlText
      eTOC = $ "<div class='toc' />"

      # Find and update external links
      eText.find("a[href^='http']").attr('target','_blank')
      # Find and process prettyprint codes
      eText.find("pre>code").each () ->
        $code = $(this); $pre = $code.parent()
        text = $code.text()
        if (text.slice(0,3) == ":::")
          eol = text.indexOf "\n"
          lang = text.slice 3, eol
          text = text.slice eol + 1
        $pre.replaceWith(prettyPrintOne(
          "<pre class='prettify'>"+
            "<code class='language-#{lang}'>"+
              "#{text}"+
            "</code>"+
          "</pre>"
        , lang))
      # Build indexes
      count = 0
      eText.find("h2,h3,hr").each () ->
        eThis = $(this)
        eLi = $("<li/>")
        switch eThis.prop('tagName')
          when "HR"
            eLi.addClass('divider')
          when "H2"
            eLi.addClass('nav-header')
            eLi.text(eThis.text())
          when "H3"
            count = count + 1
            id = eThis.attr 'id'
            eLink = $("<a/>")
            eLink.attr 'href', '#'#+$location.path()+'#'+id
            eLink.attr("ng-click", "scrollTo('#{id}',$event)")
            eLink.text(eThis.text())
            eLi.append(eLink)
          else console.log "ERRR:!!: '#{tagName}'"
        eTOC.append eLi

      element.html if count > 2 or attrs.toc == "right"
        tocHtml = "<div class='well' style='padding: 8px 0;'
                   ><ul class='nav nav-list'>#{eTOC.html()}</ul></div>"
        if attrs.toc == 'top'
          "#{tocHtml}<div>#{eText.html()}</div>"
        else "
<div class='row-fluid'>
  <div class='span4'>#{tocHtml}</div>
  <div class='span8'
      >#{eText.html()}</div>
</div>"
      else eText.html()
      $compile(element.contents())(scope)
]
