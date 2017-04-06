var node = document.getElementById('worst-meme-generator');

$('#save').bind('click', function(e) {

  domtoimage.toPng(node)
  .then(function(dataUrl) {
    console.log(dataUrl);
    //window.open(dataUrl);
    var img = $('<img src="' + dataUrl + ' />');
    $('render').empty().append(img);

    $.ajax({
      method: 'post',
      url: '/upload',
      data: $.extend(PAGE, {
        image: dataUrl
      })
    }).done(function(res) {
      alert('Saved');
    }).error(function(e) {
      alert('Error: ' + e);
    })

  })
  .catch(function(error) {
    console.error('oops, something went wrong!', error);
  });

});