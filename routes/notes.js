'use strict';

const express = require('express');
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();


// Get All (and search by query)

router.get('/', (req, res, next) => {
  const searchTerm = req.query.searchTerm;
  const folderId = req.query.folderId; 

  knex
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .modify(function (queryBuilder) {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
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


// Get a single item
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .where('id', id)
    .then(results => {
      if (results.length) {
        res.json(results[0]);
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
  const noteId = req.params.id;
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
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const updateNotes = {
    title: title,
    content: content,
    folder_id: folderId  // Add `folderId`
  };

  knex('notes')
    .where('id', noteId)
    .update(updateNotes)
    .returning(['id'])
    .then(() => {
      return knex
        .select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
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

  const newItem = {
    title: title,
    content: content,
    folder_id: folderId  // Add `folderId`
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
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;

  knex('notes')
    .insert(newItem)
    .into('notes')
    .returning('id')
    .then(([id]) => {
      noteId = id;
      // Using the new id, select the new note and the folder
      return knex.select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then(([result]) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});

// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('notes')
    .where('id', id)
    .del()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
