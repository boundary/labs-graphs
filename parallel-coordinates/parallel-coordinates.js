(function($, undefined) {

  window.parallel_coordinates = Backbone.View.extend({

    render: function() {

      var self = this;

      this.canvas = {};
      this.canvas.el = document.createElement('canvas');
      this.canvas.el.width = this.width;
      this.canvas.el.height = this.height;
      this.canvas.ctx = this.canvas.el.getContext('2d');
      this.el.appendChild(this.canvas.el);

      var scrubbers = [];
      var space = (this.width-this.gutter.x)/(this.columns.length-1);

      for (var i = 0; i < this.columns.length; i++) {
        var s = this.make('span', {
          "class": 'scrubber',
          "style": 'top: ' + (this.gutter.y-10) + 'px;' +
            'left: ' + ((i * space) - 7) + 'px;' +
            'height: ' + (this.height-((this.gutter.y-10)*2)) + 'px'
        });
        this.el.appendChild(s);
        var cheese = s.appendChild(this.make('span', {
          "rel": this.columns[i],
          "style": 'height: ' + (this.height-((this.gutter.y-10)*2)) + 'px'
        }));
        $(cheese).draggable({
          containment: $(s),
          axis: 'y',
          start: function(e, ui) {
            $(this).addClass('active');
            self.active = true;
          },
          drag: function(e, ui) {
            self.addFilter(self.getColumnRange(this, self));
            self.update(self.data);
          },
          stop: function(e, ui) {
            $(this).removeClass('active');
            self.active = false;
            self.addFilter(self.getColumnRange(this, self));
          }
        }).resizable({
          containment: $(s),
          handles: 'n,s',
          start: function(e, ui) {
            $(this).addClass('active');
            self.active = true;
          },
          resize: function(e, ui) {
            var range = self.getColumnRange(this, self);
            //ctx.font = "12px Helvetica";
            var x = _(self.cols).detect(function(col) { return col.col == range.field; }).x;
          },
          stop: function(e, ui) {
            $(this).removeClass('active');
            self.active = false;
            self.addFilter(self.getColumnRange(this, self));
          }
        });
        scrubbers.push(s);
      };

      $(this.el).css({
        'height': this.height,
        'width': this.width
      });

      return this;
    },

    className: 'parallel-coordinates',

    getColumnRange: function(scrubber, self) {
      var column = $(scrubber).attr('rel');
      var max = self.range[column].max;
      var min = self.range[column].min;
      var top = $(scrubber).position().top-8;
      var height = $(scrubber).height()-7;
      var step = (max - min) / ((self.height) - ((self.gutter.y)*2));
      return {
        field: column,
        max: max - (top*step),
        min: max - ((top+height)*step),
        top: top,
        height: height
      };
    },
    
    addFilter: function(filter) {
      //console.log(filter.field, filter.min, filter.max);
      this.filter[filter.field] = {
        min: filter.min,
        max: filter.max
      };
      //console.log(this.filter);
      this.update(this.data);
    },

    applyFilter: function(data) {
      var self = this;
      return _(data).filter(function(d,k) {
        var included = true;
        _(self.filter).each(function(filter, col) {
          if ((d[col] <= filter.min) || (d[col] >= filter.max))
            included = false;
        });
        return included;
      });
    },

    update: function(data) {
      this.data = data;
      if (this.emit) {
        //hack
        this.emit();
      }

      var self = this,
          ctx = this.canvas.ctx,
          cols = this.columns,
          n = this.columns.length,
          w = this.width,
          h = this.height,
          alias = this.alias;

      if (this.active) {
        //return;
      }
      
      //console.log('data', _(data).size());
      var filtered = this.applyFilter(data);
      this.size = filtered.length;
      //console.log('filtered', filtered.length);
      this.cols = [];

      var line_stroke = this.lineStroke || "hsla(0,00%,30%," + (1/Math.sqrt(this.size)) + ")";
      var text_fill = this.textFill || "#222";
      ctx.clearRect(0, 0, w, h);

      // Get column ranges
      this.range = {};
      _(cols).each(function(col) {
        var min = _(data).chain().pluck(col).min().value(),
            max = _(data).chain().pluck(col).max().value();
        self.range[col] = {
          min: min,
          max: max,
          size: max-min
        };
      });

      // Draw columns
      var space = (w-2-this.gutter.x)/(n-1);
      _(cols).each(function(col,i) {
        if (typeof alias[col] == 'string') {
          var name = alias[col];
        } else {
          var name = col;
        }
        self.cols.push({
          col: col,
          x: space*i
        });
        ctx.fillStyle = "hsla(0,0%,30%,0.05)";
        ctx.fillRect(space*i-1, self.gutter.y-12, 2, h-(2*self.gutter.y)+24);
        ctx.fillStyle = text_fill;
        ctx.font = "bold 12px Helvetica";
        ctx.fillText(name, space*i, 12);
        ctx.font = "12px Helvetica";
        ctx.fillText(self.range[col].min, space*i, h-24);
        ctx.fillText(self.range[col].max, space*i, 28);
      });
      function gutters(gutter, h, d, col) {
        if (self.range[col].size == 0) {
          return gutter+((h-(2*gutter))/2);
        } else {
          return gutter+(h-(2*gutter))*((self.range[col].max-d[col])/self.range[col].size);
        }
      };

      ctx.strokeStyle = line_stroke;
      _(filtered).each(function(d,k) {
        ctx.beginPath();
        var x0 = 0;
        var y0 = 0;
        _(cols).each(function(col,i) {
          if (i == 0) {
            var x = space*i;
            var y = gutters(self.gutter.y, h, d, col);
            ctx.moveTo(x, y);
            x0 = x;
            y0 = y;
          } else {
            // ctx.lineTo(space*i, gutters(gut, h, d, col));
            var x = space*i;
            var y = gutters(self.gutter.y, h, d, col);
            var cp1x = x - 0.65*(x-x0);
            var cp1y = y0;
            var cp2x = x - 0.35*(x-x0);
            var cp2y = y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            x0 = x;
            y0 = y;
          }
        });
        ctx.stroke();
      });
    },

    initialize: function (options) {
      this.filter = {};
      for (var k in options) {
        this[k] = options[k];
      }
      this.render();
    }
  });
})(jQuery);
