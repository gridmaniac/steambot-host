module.exports = function() {
    $('#upload-steam-ids').click(function() {
        $('#steam-ids').trigger('click');
    });

    $('#steam-ids').on('change', function() {
        $('#steam-ids-label').html(`Steam IDs: ${$('#steam-ids').val().split('\\').pop()}`);
    });  
};