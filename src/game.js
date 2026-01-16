
var jsonfile = require('jsonfile');

var scores = require('../scores.json');

var cardset = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K'];

var set = [];
var operators = ['*', '+', '-', '/'];

newSet();

function validJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function solve(sset) {
  const newSset = sset.map(val => {
    const numericValue = getCardValue(val)
    if (numericValue >= 1 && numericValue <= 13) {
      return cardset[numericValue - 1];
    }
    return val;
  });

  function ssolve(curexp, unused, nums) {
    if (unused.length == 0) {
      if (Math.abs(pcalc(curexp, true) - 24) < Math.pow(10, -8)) return curexp;
      return undefined;
    }
    for (var i = 0; i < unused.length; ++i) {
      var newunused = unused.slice(0);
      var c = newunused.splice(i, 1);
      if (!operators.includes(c) || nums >= 2) {
        var solution = ssolve(
            curexp + c, newunused, nums + (operators.includes(c) ? -1 : 1));
        if (solution != undefined) return solution;
      }
    }
    return undefined;
  }
  function makeops(ops) {
    if (ops.length == 3) return ssolve('', newSset.concat(ops.split('')), 0);
    for (var i = 0; i < operators.length; ++i) {
      solution = makeops(ops + operators[i]);
      if (solution != undefined) return solution;
    }
    return undefined;
  }
  return makeops('');
}

function pcalc(expr, fourfunc) {
  function fact(a) {
    return a < 2 ? 1 : a * fact(a - 1);
  }
  var stack = [];
  for (var i in expr) {
    if (!fourfunc) {
      switch (expr[i]) {
        case '!':
          if (stack.length < 1) return undefined;
          stack.push(fact(stack.pop()));
          continue;
        case '^':
          if (stack.length < 2) return undefined;
          var a = stack.pop();
          stack.push(Math.pow(stack.pop(), a));
          continue;
      }
    }
    switch (expr[i]) {
      case '+':
        if (stack.length < 2) return undefined;
        stack.push(stack.pop() + stack.pop());
        break;
      case '-':
        if (stack.length < 2) return undefined;
        var a = stack.pop();
        stack.push(stack.pop() - a);
        break;
      case '*':
        if (stack.length < 2) return undefined;
        stack.push(stack.pop() * stack.pop());
        break;
      case '/':
        if (stack.length < 2) return undefined;
        var a = stack.pop();
        stack.push(stack.pop() / a);
        break;
      default:
        stack.push(getCardValue(expr[i]));
        break;
    }
  }
  if (stack.length != 1) return undefined;
  return stack[0];
}

function getCardAliases(card) {
  const upperCaseCard = String(card).toUpperCase();
  const numericValue = getCardValue(upperCaseCard);
  return [upperCaseCard, upperCaseCard.toLowerCase(), String(numericValue)];
}

function isValidOperator(char) {
  return operators.includes(char);
}

function isPotentialCardAlias(alias) {
  const numericValue = parseInt(alias, 10);
  if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 13) {
    return true;
  }
  return cardset.map(c => c.toLowerCase())
      .includes(String(alias).toLowerCase());
}

function valid(expr) {
  let tempUnused = [...set];

  for (const char of expr) {
    if (isValidOperator(char)) {
      continue;
    }

    if (isPotentialCardAlias(char)) {
      const numericValue = getCardValue(char);
      const standardizedCard = cardset[numericValue - 1];

      const indexInUnused = tempUnused.indexOf(standardizedCard);
      if (indexInUnused > -1) {
        tempUnused.splice(indexInUnused, 1);
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  return tempUnused.length === 0;
}

function getCardValue(card) {
  const numericValue = parseInt(card, 10);
  if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 13) {
    return numericValue;
  }
  return cardset.indexOf(String(card).toUpperCase()) + 1;
}

function newSet() {
  set = [];
  for (var i = 0; i < 4; ++i) set.push(cardset[Math.floor(13 * Math.random())]);
  if (solve(set) == undefined) newSet();
}

function savescores() {
  jsonfile.writeFile(__dirname + '/../scores.json', scores, function(e) {
    if (e != null) console.error('Error saving scores: ' + e);
  });
}

module.exports = {
  scores : scores,
  cardset : cardset,
  set : set,
      get currentSet() {
        return set;
      },
  newSet : newSet,
  solve : solve,
  pcalc : pcalc,
  valid : valid,
  savescores : savescores,
  validJSON : validJSON,
  getCardValue : getCardValue
};
