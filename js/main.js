// listen for HTML5 native drag and drop API dragstart event
document.addEventListener('dragstart', function (event) {
    // use interact.js' matchesSelector polyfil to
    // check for match with your draggable target
    if (interact.matchesSelector(event.target, '.pickme, .pickme *')) {
        // prevent and stop the event if it's on a draggable target
        event.preventDefault();
        event.stopPropagation();
    }
});
/* GALLERY DRAG */
    interact('.pickme').draggable({
      'manualStart' : true,      
      'onmove' : function (event) {

        var target = event.target;

        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
  
        // translate the element
        target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  
        // update the posiion attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);

      },
      'onend' : function (event) {

        console.log('Draggable: ', event);

      }
    }).on('move', function (event) {

      var interaction = event.interaction;

      // if the pointer was moved while being held down
      // and an interaction hasn't started yet
      if (interaction.pointerIsDown && !interaction.interacting() && event.currentTarget.classList.contains('orig')) {

        var original = event.currentTarget;

        
        // create a clone of the currentTarget element
        var clone = event.currentTarget.cloneNode(true);
        var x = clone.offsetLeft;
        var y = clone.offsetTop;

        // insert the clone to the page
        // TODO: position the clone appropriately
        document.getElementById('gallery').appendChild(clone);
        clone.classList.remove('orig');
        clone.setAttribute('clonable','false');
        clone.style.position = "absolute";
        clone.style.left = original.offsetLeft+"px";
        clone.style.top = original.offsetTop+"px";


        // start a drag interaction targeting the clone
        interaction.start({ name: 'drag' }, event.interactable, clone);

      } else {

        interaction.start({ name: 'drag' }, event.interactable, event.currentTarget);

      }

    });

/* DRAGGING */

// target elements with the "draggable" class
interact('.draggable')
  .draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    restrict: {
      //restriction: "parent",
      //endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    // enable autoScroll
    autoScroll: true,

    // call this function on every dragmove event
    onmove: dragMoveListener,
    // call this function on every dragend event
    onend: function (event) {
      if (event.target.classList.contains('pickme')) {
        // something here to make it jump back to where it was!
      }
      var textEl = event.target.querySelector('p');

      textEl && (textEl.textContent =
        'moved a distance of '
        + (Math.sqrt(event.dx * event.dx +
                     event.dy * event.dy)|0) + 'px');
    }
  });

  function dragMoveListener (event) {
    var target = event.target,
        
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
     target.setAttribute('data-x', x);
     target.setAttribute('data-y', y);
  }

  // this is used later in the resizing and gesture demos
  window.dragMoveListener = dragMoveListener;

/* RESIZING */

interact('.resize-drag')
  .draggable({
    onmove: window.dragMoveListener
  })
  .resizable({
    preserveAspectRatio: true,
    edges: { left: true, right: true, bottom: true, top: true }
  })
  .on('resizemove', function (event) {
    var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

    // update the element style
    target.style.width  = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';

    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.top;

    target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px,' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    //target.textContent = Math.round(event.rect.width) + '×' + Math.round(event.rect.height);
  });

  

/* DROPPING */

  // enable draggables to be dropped into this
interact('.dropzone').dropzone({
  // only accept elements matching this CSS selector
  accept: '.pickme',
  // Require a 50% element overlap for a drop to be possible
  overlap: 0.50,

  // listen for drop related events:

  ondropactivate: function (event) {
    // add active dropzone feedback
    event.target.classList.add('drop-active');
  },
  ondragenter: function (event) {
    var draggableElement = event.relatedTarget,
        dropzoneElement = event.target;

    // feedback the possibility of a drop
    console.log('candrop!');
    dropzoneElement.classList.add('drop-target');
    draggableElement.classList.add('can-drop');
   // draggableElement.textContent = 'Dragged in';
  },
  ondragleave: function (event) {
    // remove the drop feedback style
      // event.target.querySelector('img').src = event.relatedTarget.querySelector('img').src;
      event.target.classList.remove('drop-target');
      event.relatedTarget.classList.remove('can-drop');
      //event.relatedTarget.textContent = 'Dragged out';
  },
  ondrop: function (event) {
    //event.relatedTarget.textContent = 'Dropped';
        console.log('dropped!');
    event.target.querySelector('img').src = event.relatedTarget.querySelector('img').src;
    event.relatedTarget.remove();
      },
  onend: function (event) {
    //event.relatedTarget.textContent = 'Dropped';
        console.log('end!');
    event.target.querySelector('img').src = event.relatedTarget.querySelector('img').src;

  },
  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove('drop-active');
    event.target.classList.remove('drop-target');
  }
});

/* PINCH TO ZOOM */
var scale = 1,
    resetTimeout;

interact('.pinchzoom')
  .gesturable({
    onstart: function (event) {
      clearTimeout(resetTimeout);
      scaleElement.classList.remove('reset');
    },
    onmove: function (event) {
      scale = scale * (1 + event.ds);
      var scaleElement = event.target;
      scaleElement.style.webkitTransform =
      scaleElement.style.transform =
        'scale(' + scale + ')';

      dragMoveListener(event);
    },
    onend: function (event) {
      resetTimeout = setTimeout(reset, 1000);
      scaleElement.classList.add('reset');
    }
  })
  .draggable({ onmove: dragMoveListener });

function reset () {
  scale = 1;
  scaleElement.style.webkitTransform =
  scaleElement.style.transform =
    'scale(1)';
}
