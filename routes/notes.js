'use strict';

const express = require('express');
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

// Get All (and search by query)

router.get('/', (req, res, next) => {
  const searchTerm = req.query.searchTerm;
  const folderId = req.query.folderId; //is this supposed to be req.query.id? No. On the req.body it's folderId:
  const tagId = req.query.tagId;
  /* This is req.query which is the raw data from the database: it's an array of objects
    [
      {
        "id": 1001,
        "title": "What the government doesn't want you to know about cats",
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "folderId": 101,
        "folderName": "Drafts"
      }...
    ] 
  */

  knex('notes')
    .select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
    .modify(function (queryBuilder) {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
      if (tagId) {
        queryBuilder.where('tag_id', folderId);
      }
    })
    .orderBy('notes.id')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});


// Get a single note
router.get('/:id', (req, res, next) => {
  const notesId = req.params.id;

  knex('notes')
    .select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
    .where('notes.id', notesId)
    .then( results => {
      if (results) {
        res.json(results);
        
        /*
        [
    {
        "id": 1002,
        "title": "The most boring article about cats you'll ever read",
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "folder_id": 102,
        "folderName": "Personal",
        "tagId": 1,
        "tagName": "smile"
    },
    {
        "id": 1002,
        "title": "The most boring article about cats you'll ever read",
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "folder_id": 102,
        "folderName": "Personal",
        "tagId": 2,
        "tagName": "happy"
    }
]
        */
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// Put update an item
router.put('/:id', (req, res, next) => {
  const notesId = req.params.id;
  const { title, content, folderId } = req.body; //updateable fields

  // /***** Never trust users - validate input *****/
  // const updateObj = {};
  // const updateableFields = ['title', 'content'];

  // updateableFields.forEach(field => {
  //   if (field in req.body) {
  //     updateObj[field] = req.body[field];
  //   }
  // });

  /***** Never trust users - validate input *****/
  if (!title) { //you can use title because of object destructuring
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  //Mentor Question: How would I write the below as object destructuring? -- REFACTOR
  const updateNotes = {
    title: title,
    content: content,
    folder_id: (folderId) ? folderId : null  // sets the folderId to null if not specified
  };

  knex('notes')
    .where('id', notesId)
    .update(updateNotes)
    .returning(['id'])
    .then(() => {
      // Using the noteId, select the note and the folder info
      return knex
        .select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', notesId);
    })
    .then( ([result]) => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content, folderId } = req.body;

  // Mentor Q: how to write this as object destructuring?
  const newItem = {
    title: title,
    content: content,
    folder_id: (folderId) ? folderId : null  // sets new note with default folder value null, otherwise you get 500 error: invalid input syntax for integer: ""
  };

  /* 
  The object that you pass on POSTMAN needs to be:

  {
	"title": "updatedtitle",
	"content": "updated content",
	"folderId": 100
  }

  Note that folder_id is folderId camelcase. 

  */

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  // let notesId;

  knex('notes')
    .insert(newItem)
    .into('notes')
    .returning('id')
    .then(([id]) => { //array destructuring
      // notesId = id;
      // Using the new id, select the new note and the folder
      return knex
        .select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', id);
    })
    .then(([result]) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});

// Delete an item
router.delete('/:id', (req, res, next) => {
  const notesId = req.params.id;

  knex('notes')
    .where('id', notesId)
    .del()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
