(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));

      //creationde la lightbox

      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      // Process des éléments de la gallerie

      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);

          // gestions des filtres

          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      // fgénérations des filtres

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };

  // options du plugin

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  // event listener du plugin

  $.fn.mauGallery.listeners = function(options) {

    // ouverture de la modal light house pour chaque image

    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // click de filtrage

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);

    // navigation dans la lightbox prev et next

    $(".gallery").on("click", ".mg-prev", () => $.fn.mauGallery.methods.prevImage(options.lightboxId));
    $(".gallery").on("click", ".mg-next", () => $.fn.mauGallery.methods.nextImage(options.lightboxId));

  };

  // différent choses lié au plugins

  $.fn.mauGallery.methods = {

    // Manière très maudite générer la gallerie en row wrap

    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    // Wrap responsive

    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },

    // met un object dans le row wrap

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    //Ajout de classe responsive

    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    //ouverture de la lightbox en clickant un image

    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },

    // navigation à l'image prev

    prevImage(lightboxId) {
      const $lightboxImage = $(`#${lightboxId} .lightboxImage`);
      const currentSrc = $lightboxImage.attr("src"); // récupération de la source
      const $items = $(".gallery-item"); // in récupère la gallerie
      let currentIndex = $items.index($items.filter(`[src="${currentSrc}"]`)); // référence à l'index
    
      // calcul du nouvel undex
      const prevIndex = (currentIndex - 1 + $items.length) % $items.length;
      const newSrc = $items.eq(prevIndex).attr("src");
    
      $lightboxImage.attr("src", newSrc); // Umise à jour de la modal
    },

    // navigation à l'image next

    nextImage(lightboxId) {
      const $lightboxImage = $(`#${lightboxId} .lightboxImage`);
      const currentSrc = $lightboxImage.attr("src"); 
      const $items = $(".gallery-item"); 
      let currentIndex = $items.index($items.filter(`[src="${currentSrc}"]`)); 
    
      const nextIndex = (currentIndex + 1) % $items.length;
      const newSrc = $items.eq(nextIndex).attr("src");
    
      $lightboxImage.attr("src", newSrc); 
    },

    // génération de la modal

    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" ><</div>'
                                : '<span />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" >></div>'
                                : '<span/>'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },

    //dysplay des tags

    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    // filtrages dees objects par tags

    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };
})(jQuery);
