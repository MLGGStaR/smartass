// Loads every data part file synchronously, in order, before app.js runs.
(function () {
  var parts = [
    "who-1.js", "who-2.js", "who-3.js", "who-4.js", "who-5.js", "who-6.js",
    "who-7.js", "who-8.js", "who-9.js", "who-10.js", "who-11.js", "who-12.js",
    "who-13.js", "who-14.js",
    "what-1.js", "what-2.js", "what-3.js", "what-4.js", "what-5.js", "what-6.js",
    "what-7.js", "what-8.js", "what-9.js",
    "where-1.js", "where-2.js", "where-3.js", "where-4.js", "where-5.js", "where-6.js",
    "where-7.js", "where-8.js", "where-9.js",
    "hard-1.js", "hard-2.js", "hard-3.js", "hard-4.js", "hard-5.js", "hard-6.js"
  ];
  parts.forEach(function (p) {
    document.write('<script src="data/' + p + '"><\/script>');
  });
})();
