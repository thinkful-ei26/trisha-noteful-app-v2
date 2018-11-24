'use strict';

const express = require('express');
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

/* Get All Folders (no search filter needed) */
router.get('/', (req, res, next) => {
  knex
    .select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

/* Get Folder by id */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select('id', 'name')
    .from('folders')
    .where('id', id)
    .then( ([result]) => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* Update Folder The noteful app does not use this endpoint but we'll create it in order to round out our API */

router.put('/:id', (req, res, next) => {
  
  const id = req.params.id;
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const updateName = { name };
  
  knex('folders')
    .update(updateName)
    .where('id', id)
    .returning(['id', 'name'])
    .then( ([result]) => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

});


/* Create a Folder accepts an object with a name and inserts it in the DB. Returns the new item along the new id. */

router.post('/', (req, res, next) => {
  const { name } = req.body;

  const newItem = { name };
  /***** Never trust users - validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex('folders')
    .insert(newItem)
    .returning(['id', 'name'])
    .then(([result]) => {
      if (result) {
        // res.location(`http://${req.headers.host}/folders/${result.id}`).status(201).json(result);
        res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
      }
    })
    .catch(err => {
      next(err);
    });
});

/* Delete Folder By Id accepts an ID and deletes the folder from the DB and then returns a 204 status. */

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('folders')
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