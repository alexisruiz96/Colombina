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
      var name = e.target.id;
      scene.remove(scene.getObjectByName(name));
    } else {
      $this.addClass('active');
      // poner objecto de escena
      var name = e.target.id;
      var objClickedMesh = getObject(name);
      scene.add(objClickedMesh);
    }
  });

  function getObject(name){
    for (let i = 0; i < scene.sceneObjects.length; i++) {
      if (scene.sceneObjects[i].name == name) {
        return scene.sceneObjects[i];
      }
    }
  }

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
