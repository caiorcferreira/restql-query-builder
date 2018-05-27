import {
  curry,
  compose,
  partial,
  head,
  last,
  equals,
  prop,
  cond,
  flatten,
  concat,
  reduce,
  merge,
  mergeWithKey
} from 'ramda';

import {
  createFromBlock,
  createAsBlock,
  createTimeoutBlock,
  createHeaderBlock,
  createWithBlock,
  createHiddenBlock,
  createOnlyBlock,
  createIgnoreErrorsBlock,
  createModifiersBlock
} from './blockCreators';

import { run, andThen, toBuilder } from './builder';
import stringify from './stringify';

const getObjOnlyKey = compose(head, Object.keys);

const getApplyTargetFromBlock = function(block) {
  return cond([
    [compose(equals('with'), getObjOnlyKey), compose(getObjOnlyKey, prop('with'))],
    [compose(equals('only'), getObjOnlyKey), compose(last, prop('only'))]
  ])(block);
};

function createApplyBlock(operator, blocks) {
  const lastBlock = last(blocks);
  const blockKey = getObjOnlyKey(lastBlock);
  const applyTarget = getApplyTargetFromBlock(lastBlock);

  return {
    apply: {
      [blockKey]: {
        [applyTarget]: operator
      }
    }
  };
}

export const applyOperator = curry((reducer, builder, operator) => {
  const newBuilder = () => {
    const previousValue = builder();
    const applyed = createApplyBlock(operator, previousValue);
    return reducer(previousValue, applyed);
  };
  return newBuilder;
});

const chainQueryBuilders = partial(andThen, [compose(flatten, Array.of)]);

const mergeQueries = (key, left, right) =>
  key === 'only' ? concat(left, right) : merge(left, right);

const queryBuilderReducer = (accumulatedInput, builderResult) => {
  return reduce(mergeWithKey(mergeQueries), {}, [accumulatedInput, ...builderResult]);
};

export const queryBuilder = (input = {}) => {
  const inputBuilder = toBuilder(input);
  const chainWithInput = builder => chainQueryBuilders(inputBuilder, builder);

  return {
    use: compose(chainWithInput, createModifiersBlock),
    from: compose(queryBuilder, chainWithInput, createFromBlock),
    as: compose(queryBuilder, chainWithInput, createAsBlock),
    timeout: compose(queryBuilder, chainWithInput, createTimeoutBlock),
    headers: compose(queryBuilder, chainWithInput, createHeaderBlock),
    with: compose(queryBuilder, chainWithInput, createWithBlock),
    only: compose(queryBuilder, chainWithInput, createOnlyBlock),
    hidden: compose(queryBuilder, chainWithInput, createHiddenBlock),
    ignoreErrors: compose(queryBuilder, chainWithInput, createIgnoreErrorsBlock),
    apply: compose(queryBuilder, partial(applyOperator, [compose(flatten, Array.of), input])),
    toObject: () => run(queryBuilderReducer, input, {}),
    toString: () => stringify(run(queryBuilderReducer, input, {}))
  };
};
