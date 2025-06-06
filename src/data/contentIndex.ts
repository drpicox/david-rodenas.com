export interface ContentFile {
  path: string;
  name: string;
  size: number;
  modified: string;
  created: string;
  type: string;
  author?: string;
  date?: string;
  description?: string;
  tags?: string[];
  title?: string;
  user?: string;
}

export interface ContentIndex {
  files: ContentFile[];
  count: number;
  generated: string;
}

// Generated content index - DO NOT EDIT MANUALLY
export const contentIndex: ContentIndex = {
  files: [
  {
    "path": "/content/README.md",
    "name": "README.md",
    "size": 1784,
    "modified": "2025-06-06T12:39:03.861Z",
    "created": "2025-04-28T05:27:35.843Z",
    "type": "md",
    "title": "Welcome to my Humble WebPage!",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-06-06T12:39:03.861Z"
  },
  {
    "path": "/content/agile/README.md",
    "name": "README.md",
    "size": 831,
    "modified": "2025-04-28T05:27:35.843Z",
    "created": "2025-04-28T05:27:35.843Z",
    "type": "md",
    "title": "Agile Development",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.843Z"
  },
  {
    "path": "/content/agile/waterfall-vs-agile.md",
    "name": "waterfall-vs-agile.md",
    "size": 2524,
    "modified": "2025-04-28T05:27:35.843Z",
    "created": "2025-04-28T05:27:35.843Z",
    "type": "md",
    "title": "Waterfall Vs Agile",
    "description": "",
    "tags": [
      "testing",
      "agile"
    ],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.843Z"
  },
  {
    "path": "/content/angularjs/README.md",
    "name": "README.md",
    "size": 817,
    "modified": "2025-04-28T05:27:35.843Z",
    "created": "2025-04-28T05:27:35.843Z",
    "type": "md",
    "title": "AngularJS Resources",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.843Z"
  },
  {
    "path": "/content/angularjs/angularjs-for-designers.md",
    "name": "angularjs-for-designers.md",
    "size": 2609,
    "modified": "2025-04-28T05:27:35.844Z",
    "created": "2025-04-28T05:27:35.844Z",
    "type": "md",
    "title": "AngularJS for Designers",
    "description": "",
    "tags": [
      "teaching",
      "angularjs",
      "ui",
      "ux",
      "howto"
    ],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.844Z"
  },
  {
    "path": "/content/angularjs/components-in-es2015.md",
    "name": "components-in-es2015.md",
    "size": 1150,
    "modified": "2025-04-28T05:27:35.844Z",
    "created": "2025-04-28T05:27:35.844Z",
    "type": "md",
    "title": "AngularJS components in ES2015",
    "description": "",
    "tags": [
      "teaching",
      "angularjs",
      "es2015",
      "ddo",
      "component",
      "styleguide",
      "howto"
    ],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.844Z"
  },
  {
    "path": "/content/angularjs/components-in-typescript.md",
    "name": "components-in-typescript.md",
    "size": 4831,
    "modified": "2025-04-28T05:27:35.844Z",
    "created": "2025-04-28T05:27:35.844Z",
    "type": "md",
    "title": "AngularJS components in TypeScript",
    "description": "",
    "tags": [
      "teaching",
      "angularjs",
      "typescript",
      "ddo",
      "component",
      "styleguide",
      "howto"
    ],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.844Z"
  },
  {
    "path": "/content/angularjs/ngclass-performance-large-objects.md",
    "name": "ngclass-performance-large-objects.md",
    "size": 9958,
    "modified": "2025-04-28T05:27:35.844Z",
    "created": "2025-04-28T05:27:35.844Z",
    "type": "md",
    "title": "Angular1 Performance: ngClass and large objects",
    "description": "\n# Angular1 Performance: ngClass and large objects\n\nSome times the performance of Angular1 applications\nsuddenly drops. \nMany times it is due to ngClass,\nor while using scope: '=' in our directives.\nHere I present a simple optimization\nthat ensures the best performance.\n\n```html\n<i class=\"icon\" ng-class=\"{friendly: user.friends, male: user.isMale}\">...</i>\n<i class=\"icon\" ng-class=\"{friendly: !!user.friends, male: user.isMale}\">...</i>\n```\n\n## What is $watch?\n\nAngular updates views by observing models and expressions\nthrough _$watch_:\n\n```javascript\n$scope.$watch(whatToWatch, function onChange(newValue, oldValue) {\n  // react to the change\n}, objectEquality);\n```\n\n$watch parameters are the followings:\n\n- **whatToWatch**: $watch will track changes in this expression,\n- **onChange**: angular execute this function each time that the value changes,\n- **objectEquality**: it describes which change will trigger onChange. \n\n_ObjectEquality_ holds the performance key. \nIt only has two valid values: _true_ or _false_.\n\n\n### $watch(expr, onChange, false)\n\nThe algorithm is the following:\n\n```javascript\nvar oldValue;\nfunction onDigest() {\n  var newValue = expr;\n  if (newValue !== oldValue) {    // compare new and old\n    onChange(newValue, oldValue);\n    oldValue = newValue;          // save new value\n  }\n}\n```\n\nIt is the fastest $watch.\nIt is because the comparison \n(compare new and old) is the not-equal operator,\nand copy (save new value) is an assignation.\n\nBut it have a risk: if the value is an object or an array\nit calls onChange only when the object or array is replaced.\nIt ignores changes in fields or element changes.\n\n\n### $watch(expr, onChange, true)\n\nThe algorithm is the following: \n\n```javascript\nvar oldValue;\nfunction onDigest() {\n  var newValue = expr;\n  if (!angular.equals(newValue, oldValue)) {    // compare new and old\n    onChange(newValue, oldValue);\n    oldValue = angular.copy(newValue);          // save new value\n  }\n}\n```\n\nIt is the slowest $watch.\nIt uses _angular.equals_ for the comparison,\nand _angular.copy_ to save the value.\nBut it detects all changes, \nincluding changes in object fields or array elements.\n\n\n## Complex objects and $watch...true\n\nLet's imagine an object as the following:\n\n```javascript\nvar david = {\n  name: 'David Rodenas',\n  friends: [jairo, janton, moraleda, natalia, sarek, victor],\n};\n```\n\nThis object contains friends field. \nThis field is an array that contains other users.\nEach user may have potentially other friends.\n\n\n### Six degrees of separation\n\n[Six degrees of separation](https://en.wikipedia.org/wiki/Six_degrees_of_separation)\ntheory tell us that we can reach all our users just following friends relationships.\n\n```\n[you] - [friend1]\n[you] - [friend2]\n[you] - [friend ...]\n[you] - [friend4]\n[friend2] - [friendof1]\n[friend2] - [friendof2]\n[friend2] - [fof ...]\n[friend2] - [friendofn]\n[friendofn] - [friendofof1]\n[friendofn] - [friendofof2]\n[friendofn] - [fofof...]\n[friendofn] - [friendofofn]\n[friendofof1] - [friendofofof1]\n[friendofof1] - [friendofofof2]\n[friendofof1] - [fofofof ...]\n[friendofof1] - [friendofofofn]\n```\n\n### Complex object copy\n\n```javascript\nvar oldDavid = angular.copy(david);\n```\n\nIt creates _oldDavid_ which is a copy of _david_\nbut also a copy of each of its friends, \nfriends of friends, and all users in our domain. \n\nThus, this copy is very expensive operation.\n\n\n### Complex object equals\n\n```javascript\nvar hasChanges = !angular.equals(david, oldDavid);\n```\n\nIt compares each property of both, _oldDavid_ and _david_.\nIf a property is an array, it compares each element.\nIf elements are an object it compares once again value by value.\nAnd so on.\nIt eventually will check that each user in our domain \nhas the same name and friends.\n\nThis, this equals operations is very expensive.\n\n\n### Other complex objects\n\nThere are lots of other objects that are complex. \n\nLibrary example:\n\n```javascript\nvar davidUser = {\n  name: 'David Rodenas',\n  loans: [\n    {book: theGoodParts, expires: '2016/11/12'},\n    {book: aDeepnessInTheSky, expires: '2016/10/21'}\n  ]\n};\nvar cleanCodeBook = {\n  name: 'Clean Code',\n  author: 'Robert Cecil Martin',\n  history: [\n    {user: oriol, date: '2015/06/08'},\n    {user: lluis, date: '2015/09/24'},\n    {user: david, date: '2016/02/12'},\n    {user: granados, date: '2016/04/01'}\n  ]\n};\n```\n\nHere are not friends, but a user has books, books has more users, etc. \nIt will potentially copy all objects in our domain.\n\n\n## Ids instead of references\n\nReplacing object references by ids\ncan make objects less complex.\n\n\n### Friends example\n\n```javascript\nvar david = {\n  id: '#david',\n  name: 'David Rodenas',\n  friends: ['#jairo', '#janton', '#moraleda', '#natalia', '#sarek', '#victor'],\n};\n```\n\n### Library example\n\n```javascript\nvar davidUser = {\n  id: '#david',\n  name: 'David Rodenas',\n  loans: [\n    {book: '#theGoodParts', expires: '2016/11/12'},\n    {book: '#aDeepnessInTheSky', expires: '2016/10/21'}\n  ]\n};\nvar cleanCodeBook = {\n  id: '#cleanCode',\n  name: 'Clean Code',\n  author: 'Robert Cecil Martin',\n  history: [\n    {user: '#oriol', date: '2015/06/08'},\n    {user: '#lluis', date: '2015/09/24'},\n    {user: '#david', date: '2016/02/12'},\n    {user: '#granados', date: '2016/04/01'}\n  ]\n};\n```\n\n### Copy and equals\n\nThere are no direct references to other objects when using ids.\n\nGiven friends example, _angular.copy_ create another object, with \nfields _id_, _name_ with the same value, and a field _friends_\nwith a copy of the array with the same values.\n\n_angular.equals_ check that both objects have the same fields,\n_id_ and _name_ has the same values, and field _friends_ \nhas the same values in the same order in both objects.\n\n\n## Accelerate ngClass\n\nngClass uses _$watch-true_.\nIt needs to track changes inside an object.\n\n### Problem\n\nGiven the example:\n\n```javascript\n<i class=\"icon\" ng-class=\"{friendly: user.friends}\">...</i>\n```\n\nngClass watches the expression:\n\n```javascript\n  {friendly: user.friends}\n```\n\nIt copies and compares all user friends, \nfriend of friends, ... which is really expensive.\n\n\n### What we want\n\nWhat we really meant to write was:\n\n```javascript\n<i class=\"icon\" ng-class=\"{friendly: user.hasFriends()}\">...</i>\n```\n\nIn such case _ngClass_ would see one of the two following values:\n\n```javascript\nvar caseAddClass = {friendly: true};\nvar caseRemoveClass = {friendly: false};\n```\n\nThere is no trace of the user object.\nIt will not copy neither compare user values, friends, ...\nNo need to replace references by ids.\n\n\n### Double negation notation\n\nIt is not always feasible to add new methods or properties\nlike _user.hasFriends_.\n\nIn such cases we can use double negation `!!` to a \n_truthy_/_falsy_ value into a _true_/_false_.\n\n```javascript\n<i class=\"icon\" ng-class=\"{friendly: !!user.friends}\">...</i>\n```\n\n_ngClass_ see one of the following values:\n\n```javascript\nvar caseAddClass = {friendly: true};\nvar caseRemoveClass = {friendly: false};\n```\n\nThus, no complex object copy or comparison.\n\n\n## Comparison\n\n### Implementation oportunity\n\nUse ids instead of references is not always possible.\nThere are cases where an object will contain its own entities.\nFor example: a todo list may contain its todo objects.\n\nDouble negation notation is always possible to use.\n\n\n### Implementation cost\n\nUsing ids instead of references ensures that\n$watch will never do a large copy or comparison.\nBut it may need a deep refactor of the application.\nIt makes it one of the most difficult possible solutions.\n\nDouble negation notation is simple, \njust look for ngClass directives and add a double\nnegation operator before each object.\n\n\n### Programmer reliability\n\nUsing ids instead of references will always work.\nProgrammer has to do nothing but use it.\nIt ensures that in any case accidentally the programmer\nwill make $watch to copy and compare all domain objects. \n\nUsing double negation notation is dangerous.\nA programmer may forget use it inside a ngClass,\nwork well the first day, and later, some day\ndiscover that the app starts to behave sluggish.\n\n\n### Performance\n\n|                      | Digest-loop time |\n| ",
    "tags": [
      "angularjs",
      "performance",
      "benchmark",
      "ngClass",
      "$watch"
    ],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.844Z"
  },
  {
    "path": "/content/angularjs/ngclass-performance.md",
    "name": "ngclass-performance.md",
    "size": 1913,
    "modified": "2025-04-28T05:27:35.844Z",
    "created": "2025-04-28T05:27:35.844Z",
    "type": "md",
    "title": "AngularJS ngClass performance boost",
    "description": "",
    "tags": [
      "contributions",
      "angularjs",
      "performance",
      "benchmark"
    ],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.844Z"
  },
  {
    "path": "/content/angularjs/shopping-cart-demo.md",
    "name": "shopping-cart-demo.md",
    "size": 733,
    "modified": "2025-04-28T05:27:35.844Z",
    "created": "2025-04-28T05:27:35.844Z",
    "type": "md",
    "title": "AngularJS 1.4 Shopping Cart Demo",
    "description": "",
    "tags": [
      "projects",
      "angularjs",
      "javascript",
      "npm",
      "grunt",
      "architecture",
      "teaching"
    ],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.844Z"
  },
  {
    "path": "/content/blog/README.md",
    "name": "README.md",
    "size": 2079,
    "modified": "2025-04-28T05:27:35.845Z",
    "created": "2025-04-28T05:27:35.845Z",
    "type": "md",
    "title": "Blog",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.845Z"
  },
  {
    "path": "/content/book/README.md",
    "name": "README.md",
    "size": 970,
    "modified": "2025-04-28T05:27:35.845Z",
    "created": "2025-04-28T05:27:35.845Z",
    "type": "md",
    "title": "The Emotional and Technical Guide to Rescue Stalled Software",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.845Z"
  },
  {
    "path": "/content/contact-links.md",
    "name": "contact-links.md",
    "size": 185,
    "modified": "2025-04-28T05:27:35.845Z",
    "created": "2025-04-28T05:27:35.845Z",
    "type": "md",
    "title": "contact-links",
    "description": "",
    "tags": [],
    "author": "",
    "user": "",
    "date": "2025-04-28T05:27:35.845Z"
  },
  {
    "path": "/content/ethics/README.md",
    "name": "README.md",
    "size": 2998,
    "modified": "2025-04-28T05:27:35.845Z",
    "created": "2025-04-28T05:27:35.845Z",
    "type": "md",
    "title": "Ethics",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.845Z"
  },
  {
    "path": "/content/ethics/agile-manifesto.md",
    "name": "agile-manifesto.md",
    "size": 810,
    "modified": "2025-04-28T05:27:35.845Z",
    "created": "2025-04-28T05:27:35.845Z",
    "type": "md",
    "title": "Ethics of the Agile Manifesto",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.845Z"
  },
  {
    "path": "/content/ethics/atwood-the-programmers-bill-of-rights.md",
    "name": "atwood-the-programmers-bill-of-rights.md",
    "size": 3654,
    "modified": "2025-04-28T05:27:35.846Z",
    "created": "2025-04-28T05:27:35.845Z",
    "type": "md",
    "title": "The Programmer's Bill of Rights",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.846Z"
  },
  {
    "path": "/content/ethics/bill-of-rights.md",
    "name": "bill-of-rights.md",
    "size": 2104,
    "modified": "2025-04-28T05:27:35.846Z",
    "created": "2025-04-28T05:27:35.846Z",
    "type": "md",
    "title": "Bill Of Rights",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.846Z"
  },
  {
    "path": "/content/ethics/classroom.md",
    "name": "classroom.md",
    "size": 1615,
    "modified": "2025-04-28T05:27:35.846Z",
    "created": "2025-04-28T05:27:35.846Z",
    "type": "md",
    "title": "Ethics in the Classroom",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.846Z"
  },
  {
    "path": "/content/ethics/martin-programmers-oath.md",
    "name": "martin-programmers-oath.md",
    "size": 1147,
    "modified": "2025-04-28T05:27:35.846Z",
    "created": "2025-04-28T05:27:35.846Z",
    "type": "md",
    "title": "Martin's Programmer's Oath",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.846Z"
  },
  {
    "path": "/content/ethics/software-craftsmanship-manifesto.md",
    "name": "software-craftsmanship-manifesto.md",
    "size": 914,
    "modified": "2025-04-28T05:27:35.846Z",
    "created": "2025-04-28T05:27:35.846Z",
    "type": "md",
    "title": "Ethics and the Software Craftsmanship Manifesto",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.846Z"
  },
  {
    "path": "/content/ethics/tdd-rules.md",
    "name": "tdd-rules.md",
    "size": 1060,
    "modified": "2025-04-28T05:27:35.846Z",
    "created": "2025-04-28T05:27:35.846Z",
    "type": "md",
    "title": "TDD Rules and Ethics",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.846Z"
  },
  {
    "path": "/content/ethics/we-rule-the-world.md",
    "name": "we-rule-the-world.md",
    "size": 1200,
    "modified": "2025-04-28T05:27:35.846Z",
    "created": "2025-04-28T05:27:35.846Z",
    "type": "md",
    "title": "We Rule the World",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.846Z"
  },
  {
    "path": "/content/ethics/zivanovic-programmers-oath.md",
    "name": "zivanovic-programmers-oath.md",
    "size": 788,
    "modified": "2025-04-28T05:27:35.847Z",
    "created": "2025-04-28T05:27:35.847Z",
    "type": "md",
    "title": "Zivanovic's Programmer's Oath",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.847Z"
  },
  {
    "path": "/content/react/README.md",
    "name": "README.md",
    "size": 537,
    "modified": "2025-04-28T05:27:35.847Z",
    "created": "2025-04-28T05:27:35.847Z",
    "type": "md",
    "title": "React Resources",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.847Z"
  },
  {
    "path": "/content/react/react-dispatchers.md",
    "name": "react-dispatchers.md",
    "size": 1028,
    "modified": "2025-04-28T05:27:35.847Z",
    "created": "2025-04-28T05:27:35.847Z",
    "type": "md",
    "title": "React Dispatchers",
    "description": "",
    "tags": [
      "react",
      "redux",
      "dispatch"
    ],
    "author": "",
    "user": "",
    "date": "2025-04-28T05:27:35.847Z"
  },
  {
    "path": "/content/react/react-function.md",
    "name": "react-function.md",
    "size": 5533,
    "modified": "2025-04-28T05:27:35.847Z",
    "created": "2025-04-28T05:27:35.847Z",
    "type": "md",
    "title": "React Function",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.847Z"
  },
  {
    "path": "/content/react/react-selectors.md",
    "name": "react-selectors.md",
    "size": 2689,
    "modified": "2025-04-28T05:27:35.847Z",
    "created": "2025-04-28T05:27:35.847Z",
    "type": "md",
    "title": "React Selectors",
    "description": "",
    "tags": [
      "react",
      "redux",
      "selectors"
    ],
    "author": "",
    "user": "",
    "date": "2025-04-28T05:27:35.847Z"
  },
  {
    "path": "/content/react/react-state.md",
    "name": "react-state.md",
    "size": 5810,
    "modified": "2025-04-28T05:27:35.848Z",
    "created": "2025-04-28T05:27:35.847Z",
    "type": "md",
    "title": "React State",
    "description": "",
    "tags": [
      "react",
      "state",
      "redux"
    ],
    "author": "",
    "user": "",
    "date": "2025-04-28T05:27:35.848Z"
  },
  {
    "path": "/content/redux/README.md",
    "name": "README.md",
    "size": 546,
    "modified": "2025-04-28T05:27:35.848Z",
    "created": "2025-04-28T05:27:35.848Z",
    "type": "md",
    "title": "Redux Resources",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.848Z"
  },
  {
    "path": "/content/redux/actions.md",
    "name": "actions.md",
    "size": 1727,
    "modified": "2025-04-28T05:27:35.848Z",
    "created": "2025-04-28T05:27:35.848Z",
    "type": "md",
    "title": "Redux Actions",
    "description": "",
    "tags": [
      "redux",
      "actions"
    ],
    "author": "",
    "user": "",
    "date": "2025-04-28T05:27:35.848Z"
  },
  {
    "path": "/content/redux/ducks.md",
    "name": "ducks.md",
    "size": 1318,
    "modified": "2025-04-28T05:27:35.848Z",
    "created": "2025-04-28T05:27:35.848Z",
    "type": "md",
    "title": "Redux Ducks",
    "description": "",
    "tags": [
      "redux",
      "ducks"
    ],
    "author": "",
    "user": "",
    "date": "2025-04-28T05:27:35.848Z"
  },
  {
    "path": "/content/redux/overview.md",
    "name": "overview.md",
    "size": 2732,
    "modified": "2025-04-28T05:27:35.848Z",
    "created": "2025-04-28T05:27:35.848Z",
    "type": "md",
    "title": "Redux Overview",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.848Z"
  },
  {
    "path": "/content/redux/reducers.md",
    "name": "reducers.md",
    "size": 4524,
    "modified": "2025-04-28T05:27:35.848Z",
    "created": "2025-04-28T05:27:35.848Z",
    "type": "md",
    "title": "Redux Reducers",
    "description": "",
    "tags": [
      "redux",
      "reducers"
    ],
    "author": "",
    "user": "",
    "date": "2025-04-28T05:27:35.848Z"
  },
  {
    "path": "/content/redux/redux-overview.md",
    "name": "redux-overview.md",
    "size": 2965,
    "modified": "2025-04-28T05:27:35.849Z",
    "created": "2025-04-28T05:27:35.848Z",
    "type": "md",
    "title": "Redux Overview",
    "description": "",
    "tags": [
      "redux",
      "overview"
    ],
    "author": "",
    "user": "",
    "date": "2025-04-28T05:27:35.849Z"
  },
  {
    "path": "/content/redux/selectors.md",
    "name": "selectors.md",
    "size": 4428,
    "modified": "2025-04-28T05:27:35.849Z",
    "created": "2025-04-28T05:27:35.849Z",
    "type": "md",
    "title": "Redux Selectors",
    "description": "",
    "tags": [
      "redux",
      "selectors"
    ],
    "author": "",
    "user": "",
    "date": "2025-04-28T05:27:35.849Z"
  },
  {
    "path": "/content/simulators/README.md",
    "name": "README.md",
    "size": 1660,
    "modified": "2025-06-06T12:39:14.273Z",
    "created": "2025-06-06T12:39:14.273Z",
    "type": "md",
    "title": "Software Development Simulators",
    "description": "Interactive simulators to explore software development concepts",
    "tags": [],
    "author": "",
    "user": "",
    "date": "2025-06-06T12:39:14.273Z"
  },
  {
    "path": "/content/simulators/developer-productivity-simulator.md",
    "name": "developer-productivity-simulator.md",
    "size": 4357,
    "modified": "2025-06-13T11:42:16.044Z",
    "created": "2025-06-13T11:42:16.043Z",
    "type": "md",
    "title": "Developer Productivity Simulator",
    "description": "Interactive simulator showing how meetings and interruptions affect developer focus and productivity",
    "tags": [],
    "author": "",
    "user": "",
    "date": "2025-06-13T11:42:16.044Z"
  },
  {
    "path": "/content/simulators/technical-debt-simulator.md",
    "name": "technical-debt-simulator.md",
    "size": 2745,
    "modified": "2025-06-06T12:38:47.722Z",
    "created": "2025-06-06T12:38:47.722Z",
    "type": "md",
    "title": "Technical Debt Simulator",
    "description": "Interactive simulator showing how shortcuts create compound productivity losses over time",
    "tags": [],
    "author": "",
    "user": "",
    "date": "2025-06-06T12:38:47.722Z"
  },
  {
    "path": "/content/teaching/README.md",
    "name": "README.md",
    "size": 249,
    "modified": "2025-04-28T05:27:35.849Z",
    "created": "2025-04-28T05:27:35.849Z",
    "type": "md",
    "title": "Teaching",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.849Z"
  },
  {
    "path": "/content/testing/README.md",
    "name": "README.md",
    "size": 2457,
    "modified": "2025-04-28T05:27:35.849Z",
    "created": "2025-04-28T05:27:35.849Z",
    "type": "md",
    "title": "Testing",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.849Z"
  },
  {
    "path": "/content/testing/bowling-game-kata.md",
    "name": "bowling-game-kata.md",
    "size": 3477,
    "modified": "2025-04-28T05:27:35.849Z",
    "created": "2025-04-28T05:27:35.849Z",
    "type": "md",
    "title": "The Bowling Game Kata",
    "description": "",
    "tags": [
      "testing",
      "kata"
    ],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.849Z"
  },
  {
    "path": "/content/testing/defensive-programming.md",
    "name": "defensive-programming.md",
    "size": 2440,
    "modified": "2025-04-28T05:27:35.849Z",
    "created": "2025-04-28T05:27:35.849Z",
    "type": "md",
    "title": "Defensive Programming",
    "description": "",
    "tags": [],
    "author": "",
    "user": "",
    "date": "2025-04-28T05:27:35.849Z"
  },
  {
    "path": "/content/testing/stair-step-test.md",
    "name": "stair-step-test.md",
    "size": 1887,
    "modified": "2025-04-28T05:27:35.849Z",
    "created": "2025-04-28T05:27:35.849Z",
    "type": "md",
    "title": "Stairstep Test",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.849Z"
  },
  {
    "path": "/content/testing/the-three-rules-of-tdd.md",
    "name": "the-three-rules-of-tdd.md",
    "size": 1028,
    "modified": "2025-04-28T05:27:35.850Z",
    "created": "2025-04-28T05:27:35.849Z",
    "type": "md",
    "title": "The Three Rules of TDD",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.850Z"
  },
  {
    "path": "/content/testing/the-three-stages-of-tdd.md",
    "name": "the-three-stages-of-tdd.md",
    "size": 2967,
    "modified": "2025-04-28T05:27:35.850Z",
    "created": "2025-04-28T05:27:35.850Z",
    "type": "md",
    "title": "The Three Stages Of TDD",
    "description": "\n# The Three Stages Of TDD\n\n_[The Three Rules of TDD](/testing/the-three-rules-of-tdd) are quite popular, \nbut people usually forgot the three stages of TDD. \nThey represent the stages that a programmer does in one program increment: \nTest, Code, and Clean._\n\n```\n+",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.850Z"
  },
  {
    "path": "/content/whoami.md",
    "name": "whoami.md",
    "size": 1011,
    "modified": "2025-04-28T05:27:35.850Z",
    "created": "2025-04-28T05:27:35.850Z",
    "type": "md",
    "title": "About David Rodenas",
    "description": "",
    "tags": [],
    "author": "",
    "user": "drpicox",
    "date": "2025-04-28T05:27:35.850Z"
  }
],
  count: 46,
  generated: "2025-06-13T11:42:35.688Z"
};

