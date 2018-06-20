# RestQL Ad-Hoc Query Builder

A helper library to create dynamic _RestQL ad-hoc queries_ in Javascript.

# Instalation

`yarn add restql-builder`

`npm install --save restql-builder`

# Guide

This package offers two styles for build queries: chainable and pointless. Therefore, all examples will use both.

**Simple Query for an Endpoint**

```javascript
// from heroes as hero
const chainableheroQuery = queryBuilder()
  .from('heroes')
  .as('hero')
  .toString();

// from heroes as hero
const pointlessHeroQuery = compose(
  toString,
  as('hero'),
  from('heroes')
)();
```

**Query an Endpoint and filter results**

```javascript
const heroName = 'Link';

// from heroes as hero with name = "Link"
const chainableheroQuery = queryBuilder()
                            .from('heroes')
                            .as('hero')
                            .with('name', heroName)
                            .toString();

// from heroes as hero with name = "Link"
const pointlessHeroQuery = compose(toString,
                                   with('name', heroName),
                                   as('hero'),
                                   from('heroes'))();
```

**Query an Endpoint only for the requested fields**

```javascript
const fieldsRequired = ['name', 'stats'];

// from heroes as hero with name = "Link" only name, stats
const chainableheroQuery = queryBuilder()
                            .from('heroes')
                            .as('hero')
                            .with('name', 'Link'),
                            .only(fieldsRequired)
                            .toString();

// from heroes as hero with name = "Link" only name, stats
const pointlessHeroQuery = compose(toString,
                                   only(fieldsRequired),
                                   with('name', 'Link'),
                                   as('hero'),
                                   from('heroes'))();
```

**Query an Endpoint passing a header**

```javascript
const headers = [['accept', 'application/json']];

// from heroes as hero headers accept = "application/json"
const chainableheroQuery = queryBuilder()
                            .from('heroes')
                            .as('hero')
                            .headers(headers)
                            .toString();

// from heroes as hero headers accept = "application/json"
const pointlessHeroQuery = compose(toString,
                                   headers(headers),
                                   as('hero'),
                                   from('heroes'))();
```

**Query an Endpoint and ignore error response**

```javascript
// from heroes as hero ignore-errors
const chainableheroQuery = queryBuilder()
                            .from('heroes')
                            .as('hero')
                            .ignoreErrors()
                            .toString();

// from heroes as hero ignore-errors
const pointlessHeroQuery = compose(toString,
                                   ignoreErrors(),
                                   as('hero'),
                                   from('heroes'))();
```

# Setup

After cloning this project one can follow the steps below:

1.  `yarn install`
2.  `yarn start`, will run the tests for the package.
3.  `yarn test:w`, will watch the files and run the tests.