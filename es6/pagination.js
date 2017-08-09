module.exports = function() {
    $('.page-item a').each(function() {
        if (window.location.href.indexOf('?') == -1) {
            var href = $(this).attr('href').replace('#', '?');
            href = updateQueryStringParameter(window.location.href, 'p', $(this).attr('page'));
            $(this).attr('href', href);
        } else {
            var href = $(this).attr('href').replace('#', '&');
            href = updateQueryStringParameter(window.location.href, 'p', $(this).attr('page'));
            $(this).attr('href', href);
        }
    });

    function updateQueryStringParameter(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
            return uri + separator + key + "=" + value;
        }
    }
};