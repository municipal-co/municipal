import React, { useEffect, useMemo } from 'react';

export default function TabFocus({container, referrer, updateTriggers}) {
  if (!container) {
    throw new Error('[TabFocus]: container is required')
  }

  if (!referrer) {
    console.warn('[TabFocus]: referrer is not provided, when the current drawer/modal is closed the focus will not be returned to the trigger element.')
  }

  const focusableElements = useMemo(() => {
    const elements = Array.from(container.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    console.log(elements);
    return elements;
  }, [updateTriggers]);

  const focusOnFirstElement = () => {
    const firstVisibleElement = focusableElements.find((element) => {
      return element.checkVisibility()
    })

    firstVisibleElement?.focus();
  }

  const focusOnLastElement = () => {
    const lastVisibleElement = focusableElements.findLast((element) => {
      return element.checkVisibility()
    })

    lastVisibleElement?.focus();
  }

  const onBlurFirstItem = (evt) => {
    if(!container.contains(evt.relatedTarget)) {
      focusOnLastElement();
    }
  }

  const onBlurLastItem = (evt) => {
    if(!container.contains(evt.relatedTarget)) {
      focusOnFirstElement();
    }
  }

  useEffect(() => {
    const firstVisibleElement = focusableElements.find((element) => {
      return element.checkVisibility()
    })
    const lastVisibleElement = focusableElements.findLast((element) => {
      return element.checkVisibility()
    })

    firstVisibleElement.addEventListener('blur', onBlurFirstItem);
    lastVisibleElement.addEventListener('blur', onBlurLastItem);

    return () => {
      firstVisibleElement.removeEventListener('blur', onBlurFirstItem);
      lastVisibleElement.removeEventListener('blur', onBlurLastItem);
    }

  }, [focusableElements])

  useEffect(() => {
    return () => {
      referrer?.focus();
    }
  }, [])
}


