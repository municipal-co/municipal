import React from "react";

 const NavigationCategories = ((props) => {
  const buildButtons = () => {
    let newCategories = props.categories.map((category, index) => {
    const classNames = props.currentMenu == category ?
      'category-button btn category-button--active btn-secondary' :
      'category-button btn btn-primary'

      return (<button key={index} className={classNames} onClick={props.clickCallback}> {category} </button>)
    })

    return newCategories;
  }

  return (
    <div className="navigation__categories">
      {buildButtons()}
    </div>
  )
})

export default NavigationCategories;