(function() {
  var cartContainer = document.getElementById("CartContainer");
  var checkout = document.getElementsByClassName('order-summary__section--discount')[0];

  var idme = `<div class="idme-shopify">
    <span class='idme-btn-affinity'>Government Employees, Medical Providers, Military, Nurses, First Responders, and Teachers receive 20% off</span>
    <br><span class="idme-btn-unify">
      <a href="https://discountify.id.me/oauth/checkpoint/municipalco" >
        <img src="https://s3.amazonaws.com/idme/buttons/v4/verify-with-idme.png" alt="ID.me" style="height:37px"/>
      </a>
    </span>
  </div>`;


  checkout && checkout.insertAdjacentHTML("afterend", idme);
})();

