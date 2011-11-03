function has(id, nuts) {
  return _(nuts).detect(function(d) {
    return d.id == id;
  });
};

var transformed = _(vegetables)
  .chain()
  .filter(function(veg) {
    var nuts = veg.nutrients;
    return has(203, nuts) && // Protein
           has(301, nuts) && // Calcium
           has(307, nuts) && // Sodium
           has(291, nuts) && // Fiber
           has(401, nuts) && // Vitamin C
           has(306, nuts);  // Potassium
    })
  .map(function(veg) {
    return {
      name: veg.name,
      protein: _(veg.nutrients).find(function(d) { return d.id == "203" }).amount,
      calcium: _(veg.nutrients).find(function(d) { return d.id == "301" }).amount,
      sodium: _(veg.nutrients).find(function(d) { return d.id == "307" }).amount,
      fiber: _(veg.nutrients).find(function(d) { return d.id == "291" }).amount,
      vitaminc: _(veg.nutrients).find(function(d) { return d.id == "401" }).amount,
      potassium: _(veg.nutrients).find(function(d) { return d.id == "306" }).amount
    }
    })
  .value();

  $('body').html(JSON.stringify(transformed));

