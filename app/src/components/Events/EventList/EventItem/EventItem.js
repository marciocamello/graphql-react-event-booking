import React from 'react';

import './EventItem.css';

const eventItem = props => {
  return (
    <li key={props.eventId} className="events__list-item">
        <div>
          <h1>{props.title}</h1>
          <h2>{parseFloat(props.price)
                .toLocaleString(navigator.language,{style:'currency',currency:'USD'})
              } - {new Date(props.date).toLocaleDateString(navigator.language)}</h2>
        </div>
        <div>
          {props.userId === props.creatorId
            ? <p>Your the owner of this event</p>
            : <button className="btn" onClick={props.onDetail.bind(this, props.eventId)}>View Details</button>
          }
        </div>
    </li>
  );
};

export default eventItem;
