# incomplete

tuck = 7  # space for handles

parallel_coordinates = Backbone.View.extend
  render: -> {
    self = @
    @canvas =
      el: @make 'canvas'
        width: @width
        height: @height
    @ctxAll = @canvas.el.getContext('2d')
    @el.appendChild(@canvas.el)

    scrubbers = []
    space = (@width-@gutter.x)/(@columns.length-1)

    for [i in 0..@columns.length]
      holder = @make 'span'
        class: 'scrubber'
        style: 'top:' + (@gutter.y-10) + 'px;' +
              'left:' + ((i*spac)-7) + 'px;' +
           'height: ' + (@height-((@gutter.y-10)*2)) + 'px'
      @el.appendChild(holder)
      scrubber = holder.appendChild(@make('span',
        rel: @columns[i]
        style: 'height:' + (@height-((@gutter.y-10)*2)) + 'px'

      $(scrubber).draggable(
        containment: $(holder)
        axis: 'y'
        start: ->
          $(@).addClass('active')
          self.active = true
        drag: ->
          self.addFilter(self.scrubRange(@, self)) #model
        stop: ->
          $(@).removeClass('active')
          self.active = false
          self.addFilter(self.scrubRange(@, self)) #model
      ).resizable(
        containment: $(holder)
        handles: 'n,s'
        start: ->
          $(@).addClass('active')
          self.active = true
        resize: ->
          range = self.scrubRange(@, self)
          x = _(self.cols).detect((col) -> { col.col == range.field; }).x
        stop: ->
          $(@).removeClass('active')
          self.active = false
          self.addFilter(self.scrubRange(@, self)) #model
      )

      scrubbers.push(scrubber)
    return @
  }
  className: 'parallel-coordinates'
  scrubRange: (scrubber) -> {
    column = $(scrubber).attr('rel')
    max = self.range[column].max
    min = self.range[column].min
    top = $(scrubber).position().top - tuck - 1
    height = $(scrubber).height() - tuck
    step = (max - min) / ((self.height) - ((self.gutter.y)*2))
    return
      field: column
      max: max - (top*step)
      min: max - ((top+height)*step)
      top: top
      height: height
  }
  addFilter: (filter) ->
    @filter[filter.field] =
      min: filter.min
      max: filter.max
    @update(@data)
  applyFilter: (data) -> {
    self = @
    return _(data).filter((d,k) ->
      included = true
      _(self.filter).each((filter,col) ->
        if (filter.min <= d[col] <= filter.max)
          included = false
      return included
    )
  }
  update: (data) ->
    @data = data
    if @emit
      @emit #hack
    
