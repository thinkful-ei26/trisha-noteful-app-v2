'use strict';

function hydrateNotes(input) {
  const hydrated = [], lookup = {};

/* When you look up note, you'll get an array of results with objects inside representing a tag. So that there are no duplicates for tagId and tagName, must set those tags into an array */
  for (let note of input) {
    if (!lookup[note.id]) {
      lookup[note.id] = note;
      lookup[note.id].tags = [];
      hydrated.push(lookup[note.id]);
    }
    if (note.tagId || note.tagName) {
      lookup[note.id].tags.push({
        id: note.tagId,
        name: note.tagName
      });
    }
    delete lookup[note.id].tagId;
    delete lookup[note.id].tagName;
  }
  return hydrated;
}

module.exports = hydrateNotes;