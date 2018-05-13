var timeAnimation = 1000;

jQuery( document ).ready(function($) {
  // For tooltips in body
  $("body").tooltip({
      selector: '[data-toggle="tooltip"]',
      container: 'body',
      placement: 'auto',
      html: true,
      trigger: 'hover'
  });

  // Event when click on a sceneObject
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
  });

  // Event when click on the toggleObjectVar
  $('body').on('click', '#toggleVar button#toggleObjectVar', function(e){
    e.preventDefault();
    var $this = $(this);
    var $objectsVar = $("#objectsVar");
    if ($this.hasClass('shown')) {
      $this.removeClass('shown').addClass('hidden');
      $this.children('i').removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
      $objectsVar.animate({
        height: "toggle"
      }, timeAnimation);
    } else {
      $this.removeClass('hidden').addClass('shown');
      $this.children('i').removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
      $objectsVar.animate({
        height: "toggle"
      }, timeAnimation);
    }
  });

  $('body').on('click', '.setBg:not(.active)', function(e){
    e.preventDefault();
    var $this = $(this);
    var img = $this.data('img');
    var $imgBg = $('#imgBg');
    if (img == 'none') {
      $imgBg.fadeOut('slow');
    } else {
      $imgBg.attr('src', 'sceneBackgrounds/' + img);
      $imgBg.fadeIn('slow');
    }
    $('.setBg').removeClass('active');
    $this.addClass('active');
  });
});
