(function(undefined) {
  window.Filter = Backbone.Model.extend({
    defaults: {
      filter: {}
    },

    initialize: function() {
      // apply filter when data or filter changes
      this.bind('change:data', function() {
        this.run();
      });
      this.bind('change:filter', function() {
        this.run();
      });
    },
  
    add: function(filter) {
      newFilter = this.get('filter');
      newFilter[filter.field] = {
        min: filter.min,
        max: filter.max
      };
      this.set({filter: newFilter});
      this.trigger('change:filter');  // why necessary?
    },

    remove: function(name) {
      newFilter = this.get('filter');
      delete newFilter[name];
      this.set({filter: newFilter});
      this.trigger('change:filter');  // why necessary?
    },

    run: function() {
      var self = this;
      var filtered = _(self.get('data')).filter(function(d,k) {
        return self.check(d);
      });
      this.set({filtered: filtered});
    },

    check: function(d) {
      var filter = this.get('filter')
      for (key in this.get('filter')) {
        if ((d[key] <= filter[key].min) || (d[key] >= filter[key].max))
          return false;
      }
      return true;
    }

  });
})();
