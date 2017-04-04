(function() {

  var select = document.getElementById('entry-date');

  if (select) {
    select.addEventListener('change', function() {
      window.location.href = "/" + select.options[select.selectedIndex].value;
    });
  }

})();