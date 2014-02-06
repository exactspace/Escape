start
  = left:roll ";" right:start {
    var on = [left, right];
    if (right.type == 'aggregate') {
      on = [left];
      on.push.apply(on, right.on);
    }
    return {
      'type': 'aggregate',
      'value': 0,
      'on': on,
      'kind': "" + left.kind + "; " + right.kind }}
  / roll

roll
  = left:die "+" right:roll {
    var on = [left, right];
    var result = left.value + right.value;
    if (right.type == 'sum') {
      on = [left];
      on.push.apply(on, right.on);
    }
    return {
      'type': 'sum',
      'value': result,
      'on': on,
      'kind': "" + left.kind + " +" + right.kind }}
  / left:die "-" right:roll {
    var on = [left, right];
    var result;
    if (right.type == 'difference') {
      on = [left];
      on.push.apply(on, right.on);
    }

    if (left.type == 'int') {
      if (right.type == 'difference') {
        result = (- left.value) + right.value;
      } else {
        result = - (left.value + right.value);
      }
    } else {
      if (right.type == 'difference') {
        result = left.value + right.value;
      } else {
        result = left.value - right.value;
      }
    }

    return {
      'type': 'difference',
      'value': result,
      'on': on,
      'kind': "" + left.kind + " -" + right.kind }}
  / die

die
  = qty:(integer / "") [dD] ceil:integer {
    if (qty > 1024 || ceil > 1024) {
      throw "values too large"
    }

    if (qty == "") qty = 1;

    var result = 0;
    var on = [];
    for (var i = 0; i < qty; i++) {
      var _r = Math.floor(Math.random() * ceil) + 1;
      result += _r;
      on.push(_r);
    }

    return {
      'type': 'roll',
      'value': result,
      'on': on,
      'kind': "" + qty + "D" + ceil }}
  / val:integer { return { 'type': 'int', 'value': val, 'kind': "" + val } }

integer "integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }