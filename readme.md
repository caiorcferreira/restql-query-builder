# RestQL Ad-Hoc Query Builder

A helper library to create dynamic _RestQL ad-hoc queries_ in Javascript.

# Instalation

`yarn add restql-builder`

`npm install --save restql-builder`

# Guide

This package offers two styles for building queries: chainable and pointless. Therefore, all examples will use both.

**Importing the lib**

```javascript
// Chainable utility
import queryBuilder from 'restql-query-builder';

// Pointless funtions
import { from, as, only, ... } from 'restql-query-builder';
```



**Simple Query for an Endpoint**

```javascript
// FROM heroes AS hero
const chainableHeroQuery = queryBuilder()
  .from('heroes')
  .as('hero')
  .toString();

// FROM heroes AS hero
const pointlessHeroQuery = compose(
  toString,
  as('hero'),
  from('heroes')
)();
```



**Simple Query for multiple Endpoints**

```javascript
// FROM heroes AS hero
const chainableHeroQuery = queryBuilder()
  .from('heroes')
  .as('hero')
  .toString();

// FROM heroes AS hero
const pointlessHeroQuery = compose(
  toString,
  as('hero'),
  from('heroes')
)();

// FROM sidekicks AS sidekick
const chainableSidekickQuery = queryBuilder()
								 .from('sidekicks')
								 .as('sidekick');

// FROM sidekicks AS sidekick
const pointlessSidekickQuery = compose(toString,
                                        as('sidekick'),
										from('sidekicks'));

// FROM heroes 
//    AS Hero
// FROM sidekicks
//	  AS sidekick
const chainableFinalQuery = [chainableHeroQuery, chainableSidekickQuery].join('\n');
const pointlessFinalQuery = [pointlessHeroQuery, pointlessSidekickQuery].join('\n');
```

*Note: an utility function to join queries is planned to be added soon.*



**Query an Endpoint passing query parameters**

```javascript
const heroName = 'Link';

// FROM heroes AS hero WITH name = "Link"
const chainableHeroQuery = queryBuilder()
                            .from('heroes')
                            .as('hero')
                            .with('name', heroName)
                            .toString();

// FROM heroes AS hero WITH name = "Link"
const pointlessHeroQuery = compose(toString,
                                   with('name', heroName),
                                   as('hero'),
                                   from('heroes'))();
```

This function supports all RestQL data types, including reference types, as showed below:

```javascript
// FROM sidekicks AS sidekick WITH heroId = hero.id
const chainableSidekickQuery = queryBuilder()
								 .from('sidekicks')
								 .as('sidekick')
								 .with('heroId', 'hero.id');

// FROM sidekicks AS sidekick WITH heroId = hero.id
const pointlessSidekickQuery = compose(toString,
                                       	withClause('heroId', 'hero.id')
                                        as('sidekick'),
										from('sidekicks'));
```

So the queries will be run in sequence and and the `id` field from the result of the hero query will be used in the sidekick query.



**Query an Endpoint only for the requested fields**

```javascript
const fieldsRequired = ['name', 'stats'];

// FROM heroes AS hero WITH name = "Link" ONLY name, stats
const chainableHeroQuery = queryBuilder()
                            .from('heroes')
                            .as('hero')
                            .with('name', 'Link'),
                            .only(fieldsRequired)
                            .toString();

// FROM heroes AS hero WITH name = "Link" ONLY name, stats
const pointlessHeroQuery = compose(toString,
                                   only(fieldsRequired),
                                   withClause('name', 'Link'),
                                   as('hero'),
                                   from('heroes'))();
```



**Query multiple Endpoints but not returning one of them's response**

```javascript
// FROM heroes AS hero HIDDEN
const chainableHeroQuery = queryBuilder()
  .from('heroes')
  .as('hero')
  .hidden()
  .toString();

// FROM heroes AS hero HIDDEN
const pointlessHeroQuery = compose(
  toString,
  hidden(),
  as('hero'),
  from('heroes')
)();
```



**Query an Endpoint passing a header**

```javascript
const headers = [['accept', 'application/json']];

// FROM heroes AS hero HEADERS accept = "application/json"
const chainableheroQuery = queryBuilder()
                            .from('heroes')
                            .as('hero')
                            .headers(headers)
                            .toString();

// FROM heroes AS hero HEADERS accept = "application/json"
const pointlessHeroQuery = compose(toString,
                                   headers(headers),
                                   as('hero'),
                                   from('heroes'))();
```



**Query an Endpoint and ignore error response**

```javascript
// FROM heroes AS hero IGNORE-ERRORS
const chainableheroQuery = queryBuilder()
                            .from('heroes')
                            .as('hero')
                            .ignoreErrors()
                            .toString();

// FROM heroes AS hero IGNORE-ERRORS
const pointlessHeroQuery = compose(toString,
                                   ignoreErrors(),
                                   as('hero'),
                                   from('heroes'))();
```



**Apply functions or enconders to Query arguments**

```javascript
const fieldsRequired = ['name', 'stats'];

// FROM heroes AS hero 
// 	  WITH weapons = ["sword", "shield"] -> flatten
//    ONLY name -> match(^"Knight")
const chainableHeroQuery = queryBuilder()
                            .from('heroes')
                            .as('hero')
                            .with('name', 'Link')
							.apply('flatten')
                            .only(fieldsRequired)
							.apply('match("^Knight")')
                            .toString();

// FROM heroes AS hero 
// 	  WITH weapons = ["sword", "shield"] -> flatten
//    ONLY name -> match("^Knight")
const pointlessHeroQuery = compose(toString,
                                   apply('match("^Knight")')
                                   only(fieldsRequired),
                                   apply('flatten'),
                                   withClause('name', 'Link'),
                                   as('hero'),
                                   from('heroes'))();
```



# Setup

After cloning this project one can follow the steps below:

1.  `yarn install`
2.  `yarn start`, will run the tests for the package.
3.  `yarn test:w`, will watch the files and run the tests.