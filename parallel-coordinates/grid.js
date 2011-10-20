(function($, undefined) {

  window.grid = Backbone.View.extend({

    initialize: function(options) {
      var self = this;
      for (var k in options) {
        this[k] = options[k];
      }
      this.controller.emit = function() { self.update(self.data)};
      this.cols = _(this.columns).map(function(col) {
        return {
          id: col,
          name: self.alias[col],
          field: col,
          width: self.width/self.columns.length
        }
      });
      
      this.options = {
        enableCellNavigation: true,
        enableColumnReorder: false
      };

      this.initialized = false;
      this.fresh_data = true;
      this.dataView = new Slick.Data.DataView();
      this.selectedRowIds = [];
      this.grid = new Slick.Grid("#myGrid", this.dataView, this.cols, this.options);
      this.data = {};
    },
    update: function(data) {
      var self = this;

      if (this.controller) {
        this.data = this.controller.applyFilter(this.controller.data);
      } else {
        this.data = data;
      }

      if (!this.initialized) {
        this.initialized = true;
        this.counter = 0;

        var pager = new Slick.Controls.Pager(this.dataView, this.grid, $("#pager"));

        this.dataView.onRowCountChanged.subscribe(function(e,args) {
          self.grid.updateRowCount();
          self.grid.render();
        });

        this.dataView.onRowsChanged.subscribe(function(e,args) {
          self.grid.invalidateRows(args.rows);
          self.grid.render();

          if (self.selectedRowIds.length > 0)
          {
            // since how the original data maps onto rows has changed,
            // the selected rows in the grid need to be updated
            var selRows = [];
            for (var i = 0; i < self.selectedRowIds.length; i++)
            {
              var idx = self.dataView.getRowById(self.selectedRowIds[i]);
              if (idx != undefined)
                selRows.push(idx);
            }

            self.grid.setSelectedRows(selRows);
          }
        });

        this.dataView.onPagingInfoChanged.subscribe(function(e,pagingInfo) {
          var isLastPage = pagingInfo.pageSize*(pagingInfo.pageNum+1)-1 >= pagingInfo.totalRows;
          var enableAddRow = isLastPage || pagingInfo.pageSize==0;
          var options = self.grid.getOptions();

          if (options.enableAddRow != enableAddRow)
            self.grid.setOptions({enableAddRow:enableAddRow});
        });
      } else {
        this.fresh_data = true;
      }

      this.gridUpdate();
    },
    gridUpdate: function() {
      var self = this;
      if (this.fresh_data) {
        var data = _(this.data).map(function(obj) {
          obj.id = self.counter++;
          return obj;
        });
        this.dataView.beginUpdate();
        this.dataView.setItems(data);
        this.dataView.endUpdate();
        this.fresh_data = false;
      }
    }
  });

})(jQuery);
