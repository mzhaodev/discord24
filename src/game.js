
var jsonfile = require('jsonfile');

var scores = require('../scores.json');

var cardset = [ 'A', '2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K' ];

var set = [];
var operators = ['*', '+', '-', '/'];

newSet();

function validJSON(str) {
    try {
	JSON.parse(str);
    }
    catch (e) {
	return false;
    }
    return true;
}

function solve(sset) {
    function ssolve(curexp, unused, nums) {
	if (unused.length == 0) {
	    if (Math.abs(pcalc(curexp, true) - 24) < Math.pow(10, -8))
		return curexp;
	    return undefined;
	}
	for (var i = 0; i < unused.length; ++i) {
	    var newunused = unused.slice(0);
	    var c = newunused.splice(i, 1);
	    if (!operators.includes(c) || nums >= 2) {
		var solution = ssolve(curexp + c, newunused, nums + (operators.includes(c) ? -1 : 1));
		if (solution != undefined)
		    return solution;
	    }
	}
	return undefined;
    }
    function makeops(ops) {
	if (ops.length == 3)
	    return ssolve('', sset.concat(ops.split('')), 0);
	for (var i = 0; i < operators.length; ++i) {
	    solution = makeops(ops + operators[i]);
	    if (solution != undefined)
		return solution;
	}
	return undefined;
    }
    return makeops('');
}

function pcalc(exp, fourfunc) {
    function fact(a) { return a < 2 ? 1 : a * fact(a - 1); }
    var stack = [];
    for (var i in exp) {
	if (!fourfunc) {
	    switch(exp[i]) {
	    case '!':
		if (stack.length < 1)
		    return undefined;
		stack.push(fact(stack.pop()));
		continue;
	    case '^':
		if (stack.length < 2)
		    return undefined;
		var a = stack.pop();
		stack.push(Math.pow(stack.pop(), a));
		continue;
	    }
	}
	switch (exp[i]) {
	case '+':
	    if (stack.length < 2)
		return undefined;
	    stack.push(stack.pop() + stack.pop());
	    break;
	case '-':
	    if (stack.length < 2)
		return undefined;
	    var a = stack.pop();
	    stack.push(stack.pop() - a);
	    break;
	case '*':
	    if (stack.length < 2)
		return undefined;
	    stack.push(stack.pop() * stack.pop());
	    break;
	case '/':
	    if (stack.length < 2)
		return undefined;
	    var a = stack.pop();
	    stack.push(stack.pop() / a);
	    break;
	default:
	    stack.push(cardset.indexOf(exp[i]) + 1);
	    break;
	}
    }
    if (stack.length != 1)
	return undefined;
    return stack[0];
}

function valid(exp) {
    var unused = set.slice();
    for (var i in exp){
	if (unused.indexOf(exp[i]) > -1)
	    unused.splice(unused.indexOf(exp[i]), 1);
	else if (['+', ' ', '-', '/', '*'].indexOf(exp[i]) > -1)
	    continue;
	else
	    return false;
    }
    return unused.length == 0;
}

function newSet() {
    set = [];
    for (var i = 0; i < 4; ++i)
	set.push(cardset[Math.floor(13 * Math.random())]);
    if (solve(set) == undefined)
	newSet();
}

function savescores() {
    jsonfile.writeFile(__dirname + '/../scores.json', scores, function (e) {
	if (e != null)
	    console.error('Error saving scores: ' + e);
    });
}

module.exports = {
    scores: scores,
    cardset: cardset,
    set: set,
    get currentSet() { return set; },
    newSet: newSet,
    solve: solve,
    pcalc: pcalc,
    valid: valid,
    savescores: savescores,
    validJSON: validJSON
};
