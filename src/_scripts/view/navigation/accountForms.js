import React, { useState } from "react";

const AccountForms = () => {

  const [form, setForm] = useState('sign-in');

  return(
    <div className="navigation-form">
      {form == 'sign-in' &&
        <div className="navigation-form__log-in">
          <div className="navigation-form__header">
            <h6 className="navigation-form__title">Sign in:</h6>
            <p className="navigation-form__subtitle">
              Quick checkout and history
            </p>
          </div>
          <form method="post" action="/account/login" accept-charset="UTF-8" data-login-with-shop="true">
            <input type="hidden" name="form_type" value="customer_login"/>
            <input type="hidden" name="utf8" value="✓"/>
            <div className="navigation-form__fields">
              <div className="form-group">
                <input type="email" name="customer[email]" placeholder="Email" className="form-control navigation-form__field" />
              </div>
              <div className="form-group">
                <input type="password" name="customer[password]" placeholder="Password" className="form-control navigation-form__field" />
              </div>
            </div>
            <div className="navigation-form__footer text-center">
              <button type="submit" className="btn btn-white navigation-form__button">Sign In</button>
              <button type="button" className="btn-link btn--small" onClick={() => {setForm('reset-password')}}>Forgot Your Password?</button>
              <button type="button" className="btn-link navigation-form__link-button" onClick={() => {setForm('create-account')}}>Create Acount</button>
            </div>
          </form>
        </div>
      }
      {form == 'reset-password' &&
        <div className="navigation-form__recover">
          <div className="navigation-form__header">
            <h6 className="navigation-form__title">Reset Password:</h6>
            <p className="navigation-form__subtitle">
              We will send you an email to reset your password.
            </p>
          </div>
          <form method="post" action="/account/recover" acceptCharset="UTF-8" onSubmit={() => {window.Shopify.recaptchaV3.addToken(this, "recover_customer_password")}}>
            <input type="hidden" name="form_type" value="recover_customer_password"/>
            <input type="hidden" name="utf8" value="✓"/>
            <input type="hidden" name="return_to" id="redirect_url" value=""/>
            <div className="form-group">
              <input type="email" className="form-control navigation-form__field" autoComplete="off" spellCheck="false" placeholder="Email"/>
            </div>
            <div className="navigation-form__footer text-center">
                <button type="submit" className="btn btn-white navigation-form__button">Submit</button>
                <button type="button" className="btn-link navigation-form__link-button" onClick={() => {setForm('sign-in')}}>Cancel</button>
              </div>
          </form>
        </div>
      }
      {form == 'create-account' &&
        <div className="navigation-form__signup">
          <div className="navigation-form__header">
            <h6 className="navigation-form__title">Create Account:</h6>
            <p className="navigation-form__subtitle">
              Sign up for quick checkout order history, account status and more.
            </p>
          </div>
          <form method="post" action="/account" id="create_customer" accept-charset="UTF-8" data-login-with-shop="true" onSubmit={() => {window.Shopify.recaptchaV3.addToken(this, "create_customer")} }>
            <input type="hidden" name="form_type" value="create_customer" />
            <input type="hidden" name="utf8" value="✓" />
            <div className="form-group">
              <input type="text" name="customer[first_name]" id="FirstName" className="form-control navigation-form__field" placeholder="First Name" required="" />
            </div>

            <div className="form-group">
              <input type="text" name="customer[last_name]" id="LastName" className="form-control navigation-form__field" placeholder="Last Name" required="" />
            </div>

            <div className="form-group">
              <input type="email" name="customer[email]" id="Email" className="form-control navigation-form__field" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="Email" />
            </div>

            <div className="navigation-form__header navigation-form__header--inner">
              <h6 className="navigation-form__title">Create Password:</h6>
              <p className="navigation-form__subtitle">
                Sign up for quick checkout order history, account status and more.
              </p>
            </div>

            <div className="form-group">
              <input type="password" name="customer[password]" id="CreatePassword" className="form-control navigation-form__field" placeholder="Password" data-password-field="" />
            </div>

            <div className="form-group">
              <input type="password" name="customer[password_confirmation]" id="CustomerPasswordConfirmation" className="form-control navigation-form__field" placeholder="Confirm Password" data-password-validate="" />
            </div>

            <div className="form-group">
              <div className="custom-control custom-checkbox navigation-form__checkbox-container">
                <input className="custom-control-input" type="checkbox" name="customer[accepts_marketing]" value="true" id="AcceptsMarketing" />
                <label className="custom-control-label p4" htmlFor="AcceptsMarketing">
                  Email me with news and offers.
                </label>
              </div>
            </div>


            <div className="navigation-form__footer text-center">
              <input type="submit" value="Create My Account" className="btn btn-white navigation-form__button" />
              <div className="p5 text-center">By creating an account you agree with our <br /> <a href="/pages/terms-of-service">Terms of Service</a> and <a href="/pages/privacy-policy">Privacy Policy</a></div>
              <button type="button" className="btn-link navigation-form__link-button" onClick={() => {setForm('sign-in')}}>Already have an account? Sign In</button>
            </div>
          </form>
       </div>

      }
    </div>
  )
}

export default AccountForms;