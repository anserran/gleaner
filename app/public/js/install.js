function setValid(selector, valid) {
    $(selector).removeClass('green red').addClass(valid ? 'green' : 'red');
    var icon = valid ? 'ok' : 'remove';
    $(selector + ' span').addClass('glyphicon-' + icon).removeClass('ajax-loading');
}

function checkMongo() {
    var selector = '.mongo-settings';

    // Hide ok/wrong
    $(selector + ' span').removeClass('glyphicon-ok glyphicon-remove').addClass('ajax-loading');

    var host = $('#mongoHost').val();
    var port = parseInt($('#mongoPort').val(), 10);
    var dbName = $('#dbName').val();

    if (isNaN(port)) {
        setValid(selector, false);
    } else {
        $.post("api/checkmongo", {
                mongoHost: host,
                mongoPort: port,
                dbName: dbName
            },
            function(result) {
                setValid(selector, result);
            });
    }
}

function checkRedis() {
    var selector = '.redis-settings';

    // Hide ok/wrong
    $(selector + ' span').removeClass('glyphicon-ok glyphicon-remove').addClass('ajax-loading');

    var host = $('#redisHost').val();
    var port = parseInt($('#redisPort').val(), 10);
    var dbIndex = $('#dbIndex').val();

    if (isNaN(port)) {
        setValid(selector, false);
    } else {
        $.post("api/checkredis", {
                redisHost: host,
                redisPort: port,
                dbIndex: dbIndex
            },
            function(result) {
                setValid(selector, result);
            });
    }
}

$(function() {
    $('#mongoHost,#mongoPort,#dbName').on('input', function() {
        checkMongo();
    });

    $('#redisHost,#redisPort,#dbIndex').on('input', function() {
        checkRedis();
    });

    $('#install').on("submit", function(event) {
        event.preventDefault();
        var data = $(this).serialize();
        $.post('api/install', data,
            function(result) {
                if (!result) {
                    setValid('.admin-settings', false);
                } else {
                    $('#install').addClass('gone');
                    $('#result').removeClass('gone');
                }
            });
    });

    checkMongo();
    checkRedis();
});