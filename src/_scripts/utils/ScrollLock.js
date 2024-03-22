function ScrollLock () {
  const body = document.body;
  const scrollY = window.scrollY;

  body.style.setProperty('--currentPosition', scrollY);

  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.width = '100%';
  body.style.overflow = 'hidden';
}

function ScrollUnlock () {
  const body = document.body;
  const scrollY = body.style.getPropertyValue('--currentPosition');

  body.style.position = '';
  body.style.top = '';
  body.style.width = '';
  body.style.overflow = '';
  body.style.removeProperty('--currentPosition');

  window.scrollTo(0, parseInt(scrollY || '0') * -1);
}

export {
  ScrollLock,
  ScrollUnlock,
}
