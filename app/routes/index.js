/*
 * GET home page.
 */

exports.install = function(req, res) {
    res.render('install');
};

exports.index = function(req, res) {
    res.render('index');
};

exports.partials = function(req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
};