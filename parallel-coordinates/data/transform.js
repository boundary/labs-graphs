function has(id, nuts) {
  return _(nuts).detect(function(d) {
    return d.id == id;
  });
};

function like(str, name) {
  return name.toLowerCase().indexOf(str) != -1;
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
           has(205, nuts) && // Carboyhdrate
           has(204, nuts) && // Fat
           has(269, nuts) && // Sugars
           !(like('powder', veg.name)) &&
           !(like('dehydrated', veg.name)) &&
           !(like('dried', veg.name)) &&
           !(like('canned', veg.name)) &&
           !(like('fireweed', veg.name)) &&
           !(like('catsup', veg.name)) &&
           !(like('chowchow', veg.name)) &&
           !(like('relish', veg.name)) &&
           !(like('pickles', veg.name)) &&
           !(like('cooked', veg.name)) &&
           !(like('microwaved', veg.name)) &&
           !(like('baked', veg.name)) &&
           !(like('mashed', veg.name)) &&
           !(like('hashed', veg.name)) &&
           !(like('boiled', veg.name)) &&
           !(like('pudding', veg.name)) &&
           !(like('frozen', veg.name)) &&
           !(like('sauteed', veg.name)) &&
           !(like('pancakes', veg.name)) &&
           !(like('souffle', veg.name)) &&
           !(like('flour', veg.name)) &&
           !(like('gratin', veg.name));
    })
  .map(function(veg) {
    return {
      name: veg.name,
      protein: _(veg.nutrients).find(function(d) { return d.id == "203" }).amount,
      calcium: _(veg.nutrients).find(function(d) { return d.id == "301" }).amount,
      sodium: _(veg.nutrients).find(function(d) { return d.id == "307" }).amount,
      fiber: _(veg.nutrients).find(function(d) { return d.id == "291" }).amount,
      vitaminc: _(veg.nutrients).find(function(d) { return d.id == "401" }).amount,
      potassium: _(veg.nutrients).find(function(d) { return d.id == "306" }).amount,
      carbohydrate: _(veg.nutrients).find(function(d) { return d.id == "205" }).amount,
      sugars: _(veg.nutrients).find(function(d) { return d.id == "269" }).amount,
      fat: _(veg.nutrients).find(function(d) { return d.id == "204" }).amount
    }
    })
  .sortBy(function(d) { return d.name; })
  .value();

  $('body').html("var vegetables = " + JSON.stringify(transformed) + ";");

