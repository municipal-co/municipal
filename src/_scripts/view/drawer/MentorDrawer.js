import React, { useEffect, useRef, useState } from "preact/compat";
import Close from "../icons/Close";
import ArrowDown from "../icons/ArrowDown";


export default function MentorDrawer({data, index}) {
  const drawer = useRef();
  const form = useRef();
  const mentorName = useRef();
  const email = useRef();
  const messageContainer = useRef();

  const [submitted, setSubmitted] = useState(false);
  const [hasError, setHasError] = useState(false)
  const [responseMessage, setResponseMessage] = useState('');

  const getMentorData = (mentorId) => {
    const mentor = data.mentorsData.find(mentorData => {
      return mentorData.mentor_id === mentorId;
    })
    return mentor;
  }

  const mentorData = getMentorData(data.mentorId);

  const onFormSubmit = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const mentorKey = `Mentor - ${mentorName.current.value}`

    const formData = {
      g: 'T5BTNZ',
      $email: email.current.value,
      $source: 'Mentor Flyout',
      $fields: `$source, ${mentorKey}`
    }

    formData[mentorKey] = true;

    const dataString = new URLSearchParams(formData).toString();

    fetch(form.current.action, {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cache-Control': 'no-cache'
      },
      body: dataString
    }).then(res => {
      switch (res.status) {
        case 200:
          setResponseMessage('Thanks for your entry! We\'ll reach out soon if you\'re selected.');
          setSubmitted(true);
          break;
        default:
          throw new Error(`${res.status} Submission Error: ${res.text}`)
      }
    }).catch(error => {
      setHasError(true);
      setResponseMessage('There was an error with your submission, please try again later.');
      messageContainer.current.addEventListener('transitionend', clearMessage);
      setTimeout(() => {
        setHasError(false);
      }, 5000);
    })
  }

  const clearMessage = (evt) => {
    setResponseMessage('');
  }

  const closeDrawer = () => {
    const event = new CustomEvent('drawerClose')
    drawer.current.classList.remove('is-visible');
    if(index == 0) {
      document.dispatchEvent(new CustomEvent('closeLastDrawer'));
    }
    drawer.current.addEventListener('transitionend', () => {
      document.dispatchEvent(event);
    })
  }

  const closeDrawerOnIndex = (evt) => {
    const eventIndex = evt.detail.drawerIndex;

    if(index === eventIndex) {
      closeDrawer();
    }
  }

  useEffect(() => {
    drawer.current.classList.add('is-visible');
    document.addEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    return () => {
      document.removeEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    }
  }, []);

  return (
    <div
      className="drawer mentor-drawer__container"
      key={data.id}
      id={`drawer-${data.id} `}
      ref={drawer}
    >
      <div className="drawer__inner mentor-drawer__inner">
        <div className="drawer__header mentor-drawer__header">
          <div className="drawer__header-title mentor-drawer__title">
            MUNICIPAL Mentors
          </div>
          <button
            className="drawer__close mentor-drawer__close"
            onClick={closeDrawer}
          >
            <div className="sr-only">Close modal</div>
            <Close />
          </button>
        </div>
        <div
          className="drawer__body-contents mentor-drawer__body"
          data-drawer-body
        >
          <div className="mentor-drawer__content">
            <div className="mentor-drawer__banner">
              {mentorData?.banner && (
                <img
                  className="mentor-drawer__image"
                  src={`${mentorData?.banner}&width=600`}
                  loading="lazy"
                />
              )}
            </div>
            {mentorData?.title && (
              <h2 className="mentor-drawer__content-title">
                {mentorData?.title}
              </h2>
            )}
            {mentorData?.body_content && (
              <div
                className="mentor-drawer__body-content p5"
                dangerouslySetInnerHTML={{ __html: mentorData?.body_content }}
              ></div>
            )}
          </div>

          <div className="mentor-drawer__form-container">
            <div className="mentor-drawer__arrow-container" aria-hidden>
              <ArrowDown />
            </div>
            {mentorData?.form_title && (
              <h3 className="mentor-drawer__form-title">
                {mentorData?.form_title}
              </h3>
            )}
            {mentorData?.form_body_content && (
              <div
                className="mentor-drawer__form-body-content"
                dangerouslySetInnerHTML={{
                  __html: mentorData?.form_body_content,
                }}
              ></div>
            )}
            <form
              className={`mentor-drawer__form ${submitted ? 'is-submitted' : null} ${hasError ? 'has-error' : null}`}
              action="//manage.kmail-lists.com/ajax/subscriptions/subscribe"
              onSubmit={onFormSubmit}
              ref={form}
            >
              <input
                type="hidden"
                name="$mentor"
                value={mentorData?.mentor_name}
                ref={mentorName}
              />
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="form-control mentor-drawer__input"
                  ref={email}
                />
              </div>
              <div className="form-group text-center">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
              <div
                className="mentor-drawer__message"
                ref={messageContainer}
              >
                {responseMessage}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}