// utils
const { nanoid } = require('nanoid');

// import json with initial data
let events = require('../data/eventsData.json');
const eventDefs = require('../data/eventsDefinition.js');

// aux
const replaceAt = (array, index, value) => {
  const ret = array.slice(0);
  ret[index] = value;
  return ret;
};

// Create controller for GET request to '/events'
// Returns ACK message
exports.eventsGet = async (req, res) => {
  res.send({ response: 'Events Controller API' });
};

// Create controller for GET request to '/events/all'
// Returns -
exports.eventsGetAll = async (req, res) => {
  res.json(events);
};

// Create controller for GET request to '/events/:Id'
// Returns -
exports.eventsGetById = async (req, res) => {
  // TODO
};

// Create controller for POST request to '/events/'
// Returns -
exports.eventsPost = async (req, res) => {
  // TODO: Validate event
  if (req.body) {
    // ensure structure
    let newEvent = {};
    req.body.id = nanoid(10);

    switch (req.body.type) {
      case 'event':
        newEvent = { ...eventDefs.event, ...req.body };
        break;
      case 'delay':
        newEvent = { ...eventDefs.delay, ...req.body };
        break;
      case 'block':
        newEvent = { ...eventDefs.block, ...req.body };
        break;

      default:
        res.sendStatus(400);
        break;
    }

    // Torbjorn: hmmmmmmm, can we look here?
    if (newEvent.order <= 0) {
      newEvent.order = 0;
      // insert at top
      events.forEach((e) => {
        e.order = e.order + 1;
      });
      events = [newEvent, ...events];
    } else if (newEvent.order >= events.length) {
      newEvent.order = events.length;
      events = [...events, newEvent];
    } else {
      let before = events.slice(0, newEvent.order);
      let after = events.slice(newEvent.order);
      // move all items one element down, starting from new position
      after.forEach((e) => {
        e.order = e.order + 1;
      });
      events = [...before, newEvent, ...after];
    }
    console.log('added', events);
    res.sendStatus(201);
  } else {
    console.log('nothing to add', req.body);
    res.sendStatus(400);
  }
};

// Create controller for PUT request to '/events/:id'
// Returns -
exports.eventsPut = async (req, res) => {
  const itemIndex = events.findIndex((e) => e.id == req.body.id);

  if (!itemIndex) res.sendStatus(400);
  const newEvents = replaceAt(events, itemIndex, req.body);
  events = [...newEvents];
  res.sendStatus(200);
};

// Create controller for DELETE request to '/events/'
// Returns -
exports.eventsDelete = async (req, res) => {
  if (req.params.id) {
    const itemIndex = events.findIndex((e) => e.id == req.params.id);

    if (!itemIndex) res.sendStatus(400);

    // Torbjorn: this syntax is very bad
    const e = events.splice(itemIndex, 1);
    events = [...events];
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
};
