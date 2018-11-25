'use strict';

const express = require('express');
const knex = require('../knex');

const router = express.Router();

/* GET all */

router.get('/', (req, res, next) => {
  knex('tags')
    .select()
    .then( (results) => {
      res.json(results);
    })
    .catch( err => next(err));
});

// results = [
//   {
//     'id': 1,
//     'name': 'smile'
//   },
//   {
//     'id': 2,
//     'name': 'happy'
//   }...
// ]

/* GET by id  */
router.get('/:id', (req, res, next) => {

  const tagId = req.params.id;

  knex('tags')
    .select()
    .where('id', tagId)
    .then( ([result]) => {
      res.json(result);
    })
    .catch( err => next(err));
});

// result = { 
//   "id": 1,
// "name": "smile"
// }

/* POST */

router.post('/', (req, res, next) => {
  const { name } = req.body;

  if(!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newTag = { name };

  knex('tags')
    .insert(newTag)
    .returning(['id', 'name'])
    .then( ([result]) => {
      if (result) {
        res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
      }
    })
    .catch( err => next(err));
});

/* result = {
  "name": "exampleTag"
} */

/* PUT */

router.put('/:id', (req, res, next) => {
  const tagId = req.params.id;

  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const updateTag = { name };

  knex('tags')
    .update(updateTag)
    .where('id', tagId)
    .returning( ([result]) => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch( err => next(err));
});


/* DELETE */

router.delete('/:id', (req, res, next) => {
  const tagId = req.params.id;

  knex('tags')
    .where('id', tagId)
    .del()
    .then( () => {
      res.sendStatus(204);
    })
    .catch( err => next(err));
});


module.exports = router;