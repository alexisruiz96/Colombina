jQuery( document ).ready(function($) {
    $('[data-toggle="tooltip"]').tooltip();
    $('body').on('click', '#objectsVar button.sceneObjects', function(e){
      e.preventDefault();
      var $this = $(this);
      if ($this.hasClass('active')) {
        $this.removeClass('active');
        // quitar objecto de escena
      } else {
        $this.addClass('active');
        // poner objecto de escena
      }
    })
    $('body').on('click', '#toggleVar button#toggleObjectVar', function(e){
      e.preventDefault();
      var $this = $(this);
      var $listObjects = $( "#listObjects" );
      if ($listObjects.hasClass('shown')) {
        $this.removeClass('up').addClass('down');
        $this.children('i').removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
        $listObjects.removeClass('shown').addClass('hidden');

        $('#listObjects').hide('slow');
      } else {
        $this.removeClass('down').addClass('up');
        $this.children('i').removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
        $listObjects.removeClass('hidden').addClass('shown');
        $('#listObjects').show('slow');
      }
    })
});
