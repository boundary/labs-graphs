//
// Copyright 2011, Boundary
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

(function($, undefined) {

  // get mouse position relative to container
  function getPos(el, e) {
    var parentOffset = $(el).offset(); 
    var relX = e.pageX - parentOffset.left;
    var relY = e.pageY - parentOffset.top;
    return {
      x: relX,
      y: relY
    };
  };

  var Axis= Backbone.View.extend({
    initialize: function(name, height, x, gutter) {
      var self = this;
      this.filtered = false;
      var active = false;
      this.height = height;
      this.x = x;
      this.temporary = false;
      this.wrapper  = this.make('div', {
        "class": 'axis',
        "width": 16,
        "height": height,
        "rel": name,
        "style": 'top: ' + (gutter.y-10) + 'px;' +
          'left: ' + (x-3) + 'px;'
      });
      this.el = this.make('canvas', {
        "class": 'axis-data',
        "width": 16,
        "height": height,
        "rel": name,
        "style": 'top: 0px;left: 0px;'
      });
      this.filter = this.make('canvas', {
        "class": 'axis-filter',
        "width": 16,
        "height": height,
        "style": 'top: 0px;left: 0px;'
      });
      this.wrapper.appendChild(this.el);
      this.wrapper.appendChild(this.filter);
      this.ctx = this.el.getContext('2d');
      this.filterctx = this.filter.getContext('2d');
      var events = {
        'mousedown': function() { if (self.start) self.start(); },
        'mousemove': function() { },
        'mouseup': function() { if (self.stop) self.stop(); }
      }
      for (name in events)
        this.el.addEventListener(name, events[name]);
    },
    addFilter: function(top,height) {
      this.filtered = true;
      this.filtered.top = top;
      this.filtered.height = height;
      this.filterctx.clearRect(0,0,16,this.height);
      this.filterctx.fillStyle = "rgba(0,0,0,0.07)";
      this.filterctx.fillRect(0,top,16,height);
    }
  });

  
  window.Parallel_coordinates = Backbone.View.extend({
    events: {
      'mousedown': 'activate',
      'mousemove': 'mousemove',
      'mouseup': 'deactivate',
      'click': 'resetOrDrag'
    },
    activate: function(e) {
      this.active = true;
      this.startdrag = getPos(this.el, e);
    },
    deactivate: function(e) {
      var self = this;
      var pos = getPos(this.el, e);
      var start = this.startdrag;

      // apply filter
      _(this.axes).each(function(axis, key) {
        var min = {},
            max = {};
        if (pos.x > start.x) {
          min.x = start.x;
          max.x = pos.x;
        } else {
          min.x = pos.x;
          max.x = start.x;
        }
        if (pos.y > start.y) {
          min.y = start.y;
          max.y = pos.y;
        } else {
          min.y = pos.y;
          max.y = start.y;
        }
        if ((axis.x > min.x) &&  (axis.x < max.x)) {
          self.addFilter(self.getColumnRange(min.y-self.gutter.y, max.y-self.gutter.y, key));
          axis.temporary = false;
        } else if (axis.temporary) {
          self.removeFilter(key);
        }
      });

      this.selection.ctx.clearRect(0,0,this.width,this.height);
      this.active = false;
      this.startdrag = false;
    },
    mousemove: function(e) {
      if (this.active) {
        var self = this;
        var pos = getPos(this.el, e);
        var start = this.startdrag;
        this.selection.ctx.clearRect(0,0,this.width,this.height);
        this.selection.ctx.fillStyle = "rgba(55,55,55,0.03)";
        this.selection.ctx.fillRect(start.x, start.y, pos.x-start.x, pos.y-start.y);
        // apply filter
        _(this.axes).each(function(axis, key) {
          var min = {},
              max = {};
          if (pos.x > start.x) {
            min.x = start.x;
            max.x = pos.x;
          } else {
            min.x = pos.x;
            max.x = start.x;
          }
          if (pos.y > start.y) {
            min.y = start.y;
            max.y = pos.y;
          } else {
            min.y = pos.y;
            max.y = start.y;
          }
          if ((axis.x > min.x) &&  (axis.x < max.x)) {
            self.addFilter(self.getColumnRange(min.y-self.gutter.y, max.y-self.gutter.y,key));
            axis.temporary = true;
          } else if (axis.temporary) {
            self.removeFilter(key);
          }
        });
      }
    },
    resetOrDrag: function(e) {
      var self = this;
      var pos = getPos(this.el, e);
      // remove a filter
      _(this.axes).each(function(axis, key) {
        if (Math.abs(pos.x - axis.x) <= 12)
          self.removeFilter(key);
      });
    },
    initialize: function (options) {
      var self = this;
      this.axes = {};
      this.filter = {};
      this.active = false;
      for (var k in options) {
        this[k] = options[k];
      }
      this.model.bind('change:filter', function() {
        var filters = self.model.get('filter');
        for (key in filters) {
        }
      });
      this.model.bind('change:filtered', function() {
        self.update();    
      });
      this.render();
    },
    render: function() {
      var self = this;

      this.canvas = {};
      this.selection = {};

      this.canvas.el = this.make('canvas', {
        width: this.width,
        height: this.height
      });

      this.selection.el = this.make('canvas', {
        width: this.width,
        height: this.height
      });

      this.canvas.ctx = this.canvas.el.getContext('2d');
      this.selection.ctx = this.selection.el.getContext('2d');

      this.el.appendChild(this.canvas.el);
      this.el.appendChild(this.selection.el);

      var scrubbers = [];
      var space = (this.width-this.gutter.x)/(this.columns.length-1);

      for (var i = 0; i < this.columns.length; i++) {
        var axis = this.axes[this.columns[i]] = new Axis(this.columns[i], this.height-2*(this.gutter.y-10), (i * space) - 7, this.gutter);

        this.el.appendChild(axis.wrapper);

        $(axis.wrapper).hover(function() {
          self.coloring = $(this).attr('rel');
          self.update();
        }, function() {
          self.update();
        });
      };

      $(this.el).css({
        'height': this.height,
        'width': this.width
      });

      return this;
    },

    className: 'parallel-coordinates',

    getColumnRange: function(top, bottom, column) {
      var max = this.range[column].max;
      var min = this.range[column].min;
      var height = bottom-top;
      var step = (max - min) / ((this.height) - ((this.gutter.y)*2));
      return {
        field: column,
        max: max - (top*step),
        min: max - ((top+height)*step),
        top: top,
        bottom: bottom,
        height: height
      };
    },
    
    addFilter: function(filter) {
      this.axes[filter.field].addFilter(filter.top+10,filter.height);
      this.model.add(filter);
    },

    removeFilter: function(key) {
      this.axes[key].filterctx.clearRect(0,0,16,this.height);
      this.model.remove(key);
    },

    update: function() {
      var self = this,
          ctx = this.canvas.ctx,
          cols = this.columns,
          n = this.columns.length,
          w = this.width,
          h = this.height,
          alias = this.alias;

      var data = this.model.get('data');
      var filtered = this.model.get('filtered');
      this.size = filtered.length;
      this.cols = [];

      if (!self.coloring)
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

      // Draw dots
      _(cols).each(function(col,i) {
        self.axes[col].ctx.clearRect(0, 0, 16, self.height);
      });
      _(data).each(function(d,k) {
        _(cols).each(function(col,i) {
          var y = gutters(self.gutter.y, h, d, col);
          self.axes[col].ctx.fillStyle = 'rgba(50,50,50,0.1)';
          self.axes[col].ctx.fillRect(5, y-41, 2, 2);
        });
      });

      // Draw lines
      if (line_stroke)
        ctx.strokeStyle = line_stroke;
        ctx.fillStyle = line_stroke;

      _(filtered).each(function(d,k) {
        if (self.coloring) {
          var frac = Math.round(250*(self.range[self.coloring].max-d[self.coloring])/self.range[self.coloring].size); 

          ctx.strokeStyle = "hsla(" + frac + ",35%,50%," + (4.5/Math.sqrt(self.size)) + ")";
        }

        ctx.beginPath();
        var x0 = 0;
        var y0 = 0;
        _(cols).each(function(col,i) {
          var x = space*i;
          var y = gutters(self.gutter.y, h, d, col);
          if (i == 0) {
            ctx.moveTo(x, y);
          } else {
            // ctx.lineTo(space*i, gutters(gut, h, d, col));
            var cp1x = x - 0.65*(x-x0);
            var cp1y = y0;
            var cp2x = x - 0.35*(x-x0);
            var cp2y = y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
          }
          x0 = x;
          y0 = y;
        });
        ctx.stroke();
      });
    }
  });
})(jQuery);
