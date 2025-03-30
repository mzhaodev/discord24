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

module.exports = function(client) {
    var discord24 = {};
    discord24.start = function(user, uid, cid, m, e) {
	if (m.substring(0,3) ==  "24/") {
	    solution = m.substring(3).trim();
	    switch (solution.substring(0, 4)) {
	    case 'help':
		client.sendMessage({
		    to: cid,
		    message: '`24/show` to show the current problem. `24/skip` to skip a problem. `24/ANSWER` to submit a solution (replace ANSWER with your answer). Use rpn <https://en.wikipedia.org/wiki/Reverse_Polish_notation>. `24/calc EXPR` to calculate EXPR. `24/solv["A",2,3,4]` to solve 24 with 1, 2, 3, 4. `A = 1, X = 10, J = 11, Q = 12, K = 13.`'
		});
		return;
	    case 'calc':
		client.sendMessage({
		    to: cid,
		    message: '<@!' + uid + '> `' + pcalc(solution.substring(4).trim(), false) + '`'
		});
		return;
	    case 'show':
		client.sendMessage({
		    to: cid,
		    message: 'Set: `' + JSON.stringify(set.sort((a,b)=>(cardset.indexOf(a)-cardset.indexOf(b)))) + '`'
		});
		return;
	    case 'skip':
		var ans = solve(set);
		newSet();
		client.sendMessage({
		    to: cid,
		    message: 'Skipped! Solution was: `' + ans + '`. New set: `' + JSON.stringify(set.sort((a,b)=>(cardset.indexOf(a)-cardset.indexOf(b)))) + '`'
		});
		return;
	    case 'solv':
		var expr = solution.substring(4).trim();
		client.sendMessage({
		    to: cid,
		    message: '<@!' + uid + '> `' + (validJSON(expr) ? solve(JSON.parse(expr)) : 'Invalid format. Please use 24/solv["A","2","3","4"] (the quotes are optional for the arabic numerals).') + '`'
		    });
		return;
	    case 'scor':
		client.sendMessage({
		    to: cid,
		    message: '```' + Object.keys(scores.count).map(uid=>scores.count[uid]).sort((a,b)=>(b.points-a.points)).map(a=>(a.nick+': '+a.points)).join('\n') + '```'
		});
		return;
	    }
	    if (valid(solution) && Math.abs(pcalc(solution, true) - 24) < Math.pow(10, -8)) {
		if (scores.count[uid] != undefined) {
		    scores.count[uid].nick = user;
		    ++scores.count[uid].points;
		}
		else {
		    scores.count[uid] = {
			nick: user,
			points: 1
		    };
		}
		savescores();
		newSet();
		client.sendMessage({
		    to: cid,
		    message: '<@!' + uid + '> is correct! Points: ' + scores.count[uid].points + '. New set: `' + JSON.stringify(set.sort((a,b)=>(cardset.indexOf(a)-cardset.indexOf(b)))
) + '`'
		});
	    }
	}
    };

    return discord24;
};

function savescores() {
    jsonfile.writeFile(__dirname + '/../scores.json', scores, function (e) {
	if (e != null)
	    console.error('Error saving scores: ' + e);
    });
}
