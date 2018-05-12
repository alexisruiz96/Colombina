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
    $('body').on('click', '#objectsVar button#toggleObjectVar', function(e){
      e.preventDefault();
      var $this = $(this);
      if ($this.hasClass('shown')) {
        $this.removeClass('shown').addClass('hidden');
        $this.children('i').removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
        $('#listObjects').hide('slow');
      } else {
        $this.removeClass('hidden').addClass('shown');
        $this.children('i').removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
        $('#listObjects').show('slow');
      }
    })
});
