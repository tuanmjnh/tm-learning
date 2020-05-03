import moment from 'moment';

String.prototype.convertToAscii = function() {
  // let $this = String(this)
  return (
    this.toLowerCase()
      .replace(/[ ]/g, '_')
      // .replace('[', '')
      // .replace(']', '')
      .replace(/[áàãạảâầấậẫẩăằắẵặẳ]/g, 'a')
      .replace(/[èéẹẽẻêếềễểệ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'e')
      .replace(/[òóõọỏôỗộồốổơỡờớợỡở]/g, 'o')
      .replace(/[ùúụũủưừứựữử]/g, 'u')
      .replace(/[ýỳỹỷỵ]/g, 'y')
      .replace(/[đ]/g, 'd')
      .replace(/[~\`!@#$%^&*()--+={}\\|;:\'\"<,>.?/”“‘’„‰‾–—]/g, '')
  );
};
String.prototype.removeChars = function() {
  return this.replace(/[~`!@#$%^&*()\[{}\]\\|;:\'\",<>./?]/g, '');
};

String.prototype.toHtml = function() {
  if (!this) return this;
  var el = document.createElement('div');
  el.innerHTML = this;
  return el.firstChild.data;
};

String.prototype.toUpperCaseFirst = function() {
  if (!this) return this;
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.toUpperCaseSpace = function() {
  if (!this) return this;
  const arr = this.trim().split(' ');
  let rs = '';
  for (let i = 0; i < arr.length; i++) {
    rs += arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    if (i < arr.length - 1) rs += ' ';
  }
  return rs;
};

// Format Date
String.prototype.formatDate = function(format = 'DD/MM/YYYY') {
  try {
    return moment(this).format(format);
  } catch (e) {
    return this;
  }
};

// Array
Array.prototype.pushIfNotExist = function(element, key) {
  if (Array.isArray(element)) {
    element.forEach(e => {
      if (key) {
        if (this.findIndex(x => x[key] === e[key]) < 0) this.push(e);
      } else {
        if (this.indexOf(e) < 0) this.push(e);
      }
    });
  } else {
    if (key) {
      if (this.findIndex(x => x[key] === element[key]) < 0) this.push(element);
    } else {
      if (this.indexOf(element) < 0) this.push(element);
    }
  }
};

Array.prototype.pushIfNotExistUpdate = function(element, key) {
  if (Array.isArray(element)) {
    element.forEach(e => {
      if (key) {
        const item = this.find(x => x[key] === e[key]);
        if (item) {
          Object.keys(item).forEach(k => {
            item[k] = e[k];
          });
        } else this.push(e);
      } else {
        if (this.indexOf(e) < 0) this.push(e);
      }
    });
  } else {
    if (key) {
      const item = this.find(x => x[key] === element[key]);
      if (item) {
        Object.keys(item).forEach(k => {
          item[k] = element[k];
        });
      } else this.push(element);
      // if (this.findIndex(x => x[key] === element[key]) < 0) this.push(element)
    } else {
      if (this.indexOf(element) < 0) this.push(element);
    }
  }
};

Array.prototype.sum = function(prop) {
  var total = 0;
  for (let i = 0; i < this.length; i++) {
    total += this[i][prop];
  }
  return total;
};

Array.prototype.getRandom = function() {
  return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.shuffle = function() {
  var currentIndex = this.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = this[currentIndex];
    this[currentIndex] = this[randomIndex];
    this[randomIndex] = temporaryValue;
  }
  return this;
};

Array.prototype.shuffleProperty = function(prop, root = false) {
  if (root) this.shuffle();
  for (let i = 0; i < this.length; i++) {
    if (Array.isArray(this[i][prop])) {
      this[i][prop] = this[i][prop].shuffle();
    }
  }
  return this;
};

// Array.prototype.max = function(prop) {
//   console.log('a');
//   if (prop) {
//     return Math.max.apply(
//       Math,
//       this.map(x => {
//         return x[prop];
//       })
//     );
//   } else {
//     const rs = Math.max.apply(null, this);
//     console.log(rs);
//     return rs;
//   }
// };

// Array.prototype.min = function(prop) {
//   if (prop) {
//   } else {
//     return Math.min.apply(null, this);
//   }
// };
