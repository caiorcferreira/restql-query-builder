# restQL Query Builder

A helper library to create dynamic _restQL ad-hoc queries_ in Javascript.

# Usage

**Instalation**

`yarn add restql-builder`

`npm install --save restql-builder`

**Importing the lib**

```javascript
// Chainable utility
import queryBuilder from 'restql-query-builder';

// Pointfree funtions
import { from, as, only, ... } from 'restql-query-builder';
```



# Motivation

restQL is a powerful and early adopted technology that brings a maintanable and robust solution for microservices orchestration. However, it has some limitations in terms of how one can create a query, such as lack of conditionals, dynamic response's fields filtering and optional parameters.

In order to address these and others constrains and to focus on the developer experience the **restQL Query Builder** attemps to bring the flexibility of a full fledged language such as Javascript and a multi-paradigm approach exposing two interfaces, a fluent builder and a pointfree.

To achieve these goals it  leverages the Ad-Hoc Query feature, which allow the execution of external queries send to the restQL server, and a functional design, that enables declarative and adaptable implementation of the interfaces.



# Recipes

This package offers two styles for building queries: chainable and pointfree. Therefore, all examples will use both.

**Simple Query for an Endpoint**

```javascript
// FROM heroes AS hero
const chainableHeroQuery = queryBuilder()
  .from('heroes')
  .as('hero')
  .toString();

// FROM heroes AS hero
const pointfreeHeroQuery = compose(
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

// FROM sidekicks AS sidekick
const chainableSidekickQuery = queryBuilder()
                                 .from('sidekicks')
                                 .as('sidekick');

// FROM heroes 
//    AS Hero
// FROM sidekicks
//	  AS sidekick
const chainableFinalQuery = toString([chainableHeroQuery, chainableSidekickQuery]);

// FROM heroes AS hero
const pointfreeHeroQuery = compose(as('hero'), from('heroes'))();

// FROM sidekicks AS sidekick
const pointfreeSidekickQuery = compose(as('sidekick'), from('sidekicks'));

// FROM heroes 
//    AS Hero
// FROM sidekicks
//	  AS sidekick
const pointfreeFinalQuery = toString([pointfreeHeroQuery, pointfreeSidekickQuery]);
```

*Note: an utility function to join queries is planned to be added soon.*



**Query an Endpoint passing query parameters**

```javascript
const heroName = 'Link';

// FROM heroes AS hero WITH name = "Link"
const chainableHeroQuery = queryBuilder()
                            .from('heroes')
                            .as('hero')
                            .withClause('name', heroName)
                            .toString();

// FROM heroes AS hero WITH name = "Link"
const pointfreeHeroQuery = compose(toString,
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
const pointfreeSidekickQuery = compose(toString,
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
const pointfreeHeroQuery = compose(toString,
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
const pointfreeHeroQuery = compose(
  toString,
  hidden(),
  as('hero'),
  from('heroes')
)();
```



**Query an Endpoint passing a header**

```javascript
const headers = [['accept', 'application/json']];
// OR
const headerObj = {
    accept: 'application/json'
}

// FROM heroes AS hero HEADERS accept = "application/json"
const chainableheroQuery = queryBuilder()
                            .from('heroes')
                            .as('hero')
                            .headers(headers)
                            .toString();

// FROM heroes AS hero HEADERS accept = "application/json"
const pointfreeHeroQuery = compose(toString,
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
const pointfreeHeroQuery = compose(toString,
                                   ignoreErrors(),
                                   as('hero'),
                                   from('heroes'))();
```



**Apply functions or enconders to Query arguments**

```javascript
const weapons = ['name', 'stats'];

// FROM heroes AS hero 
// 	  WITH weapons = ["sword", "shield"] -> flatten
//    ONLY name -> match(^"Knight")
const chainableHeroQuery = queryBuilder()
                            .from('heroes')
                            .as('hero')
                            .with('weapons', weapons)
							.apply('flatten')
                            .only("name")
							.apply('match("^Knight")')
                            .toString();

// FROM heroes AS hero 
// 	  WITH weapons = ["sword", "shield"] -> flatten
//    ONLY name -> match("^Knight")
const pointfreeHeroQuery = compose(toString,
                                   apply('match("^Knight")')
                                   only("name"),
                                   apply('flatten'),
                                   withClause('weapons', weapons),
                                   as('hero'),
                                   from('heroes'))();
```



**Query an Endpoint and set modifiers**

```javascript
// USE use=cache = 600 FROM heroes AS hero IGNORE-ERRORS
const chainableheroQuery = queryBuilder()
                            .use([['use-cache', 600]])
                            .from('heroes')
                            .as('hero')
                            .toString();

// USE use=cache = 600 FROM heroes AS hero IGNORE-ERRORS
const pointfreeHeroQuery = compose(toString,
                                   as('hero'),
                                   from('heroes'),
                                   use([['use-cache', 600]]))();
```



# API Reference

Although the **restQL Query Builder** exposes two interfaces they share a common schema, depicted below:

### from

**Arguments**

1. resource (*String*): the registered endpoint name that the query will target. *Note that the resource must be mapped on the restQL server that will run the query*.

### as

**Arguments**

1. alias (*String*): the name that you would like to reference the request defined by the query.

### withClause

*Disclaimer: this function should be callend `with`, but as it is a reserved keyword on Javascript other name was choosen.*
**Arguments**

1. paramaterName (*String*): the query parameter key expected by your microservice or the placeholder name defined on the mapping between the microservice's URL and the resource name.
2. paramterValue (*any*): the value that will be send to the microservice. Could be a string, number, array, map/object or restQL reference type.

### only

**Arguments**

1. fields (*Array<String>*): the response's field that you'd like to receive.

### headers

**Arguments**

1. headers (*Object* | *Array<Pair<String, any>>*): the collection of headers to be send.

### hidden

**Arguments**

1. shouldBeHidden (*[Boolean]*): optional, flag to indicate wheter the `hidden` clasue should be present on the query.

### ignoreErrors

**Arguments**

1. shouldIgnoreErrors (*[Boolean]*): optional, flag to indicate wheter the `ignore-errors` clasue should be present on the query.

### timeout

**Arguments**

1. timeoutValue (*Integer*): time to be set on query in order to wait for the microservice response.

### use

**Arguments**

1. modifiers (*Array<Pair<String, any>>*): commonly used to set cache control.



# Setup

After cloning this project one can follow the steps below:

1.  `yarn install`
2.  `yarn start`, will run the tests for the package.
3.  `yarn test:w`, will watch the files and run the tests.