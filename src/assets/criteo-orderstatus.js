(function (c, u) {
  if (window.location.pathname.indexOf('checkouts') < 0)
      return;

  var deviceType = /iPad/.test(u) ? "t" : /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Silk/.test(u) ? "m" : "d";
  var products = [];
  for(var i in c.line_items) {
      var item = c.line_items[i];
      if (item.product_id) {
          products.push({
              id: "shopify_US_" + item.product_id + "_" + item.variant_id,
              price: 0,
              quantity: item.quantity
          });
      }
  }
  var price = parseFloat(c.subtotal_price);
  if (c.discounts)
      price += parseFloat(c.discounts_amount);

  products.push({
      id: "ordertotal",
      price: price,
      quantity: 1
  });
  window.criteo_q = window.criteo_q || [];
  window.criteo_q.push(
      { event: "setAccount", account: 70703 },
      { event: "setEmail", email: c.email },
      { event: "setSiteType", type: deviceType },
      { event: "trackTransaction", zipcode: c.billing_address.zip, ecpplugin: "shopify-mc", id: c.order_id, item: products }
  );
})(Shopify.checkout, navigator.userAgent);