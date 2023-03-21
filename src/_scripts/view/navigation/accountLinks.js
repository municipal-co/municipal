import React from 'preact/compat';
import Cta from "./cta";

const AccountLinks = () => {
  return(
    <>
      <div className="account-links__header text-center">
        <h6 className="account-links__title">Hey <span className="account-links__title--highlighted-text">{ theme.customerName }</span></h6>
        { theme.customerOrders == 0 &&
          <div className="account-links__discount-message text-center" dangerouslySetInnerHTML={{ __html: theme.discountMessage.replace('<p>', '<p class="p5">') }}>
          </div>
        }
      </div>
      <Cta block={{settings: { url: '/account', label:'Account Details' }}} />
      <Cta block={{settings: { url: '/account?view=orders', label: 'Order History' }}} />
      <Cta block={{settings: { url: '/account/addresses', label: 'Shipping Addresses', "bottom-space": 'true' }}} />
      <div className="account-links__footer text-center">
        <a href="/account/logout" className="btn-link">Log Out</a>
      </div>
    </>
  )
}

export default AccountLinks;