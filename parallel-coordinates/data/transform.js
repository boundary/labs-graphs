function has(id, nuts) {
  return _(nuts).detect(function(d) {
    return d.id == id;
  });
};

function like(str, name) {
  return name.indexOf("dried") != -1;
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
           has(306, nuts) && // Potassium
           !(like('Powder', veg.name)) &&
           !(like('powder', veg.name)) &&
           !(like('Dehydrated', veg.name)) &&
           !(like('dehydrated', veg.name)) &&
           !(like('dried', veg.name)) &&
           !(like('Dried', veg.name));
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

