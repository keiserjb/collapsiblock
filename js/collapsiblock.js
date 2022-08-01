(function ($) {

  Backdrop.Collapsiblock = Backdrop.Collapsiblock || {};

  Backdrop.behaviors.collapsiblock = {

    attach: function (context, settings) {
      var cookieData = Backdrop.Collapsiblock.getCookieData();
      var slidetype = settings.collapsiblock.slide_type;
      var activePages = settings.collapsiblock.active_pages;
      var slidespeed = parseInt(settings.collapsiblock.slide_speed, 10);
      $('.collapsiblock').once('collapsiblock', function () {
        var id = this.id.split("-").pop();
        var titleElt = $(this)[0];
        if (titleElt.children.length > 0) {
          // Status values: 1 = not collapsible, 2 = collapsible and expanded,
          // 3 = collapsible and collapsed, 4 = always collapsed,
          // 5 = always expanded
          var stat = $(this).data('collapsiblock-action');
          if (stat == 1) {
            return;
          }

          titleElt.target = $(this).siblings().not($('.contextual-links-wrapper'));
          $(titleElt)
            .wrapInner('<a href="#collapse-' + id + '" role="link" aria-controls="collapse-content-' + id + '" aria-expanded="false"/>')
            .click(function (e) {
              if ($(this).is('.collapsiblockCollapsed')) {
                $(this).removeClass('collapsiblockCollapsed');
                $(this).find("a").attr('aria-expanded', true);
                if (slidetype == 1) {
                  $(this.target).slideDown(slidespeed).attr('aria-hidden', false);
                }
                else {
                  $(this.target).animate({
                    height: 'show',
                    opacity: 'show'
                  }, slidespeed);
                }
                // Set Focus on expanded content
                document.getElementById("collapse-content-" + id).focus();

                // Don't save cookie data if the block is always collapsed.
                if (stat != 4 && stat != 5) {
                  cookieData[id] = 1;
                }
              }
              else {
                $(this).addClass('collapsiblockCollapsed');
                $(this).find("a").attr('aria-expanded', false);
                if (slidetype == 1) {
                  $(this.target).slideUp(slidespeed).attr('aria-hidden', true);
                }
                else {
                  $(this.target).animate({
                    height: 'hide',
                    opacity: 'hide'
                  }, slidespeed);
                }

                // Don't save cookie data if the block is always collapsed.
                if (stat != 4 && stat != 5) {
                  cookieData[id] = 0;
                }
              }
              // Stringify the object in JSON format for saving in the cookie.
              cookieString = JSON.stringify(cookieData);
              $.cookie('collapsiblock', cookieString, {
                path: settings.basePath
              });
            });

          // Leave active blocks if Remember collapsed on active pages is false.
          // If the block is expanded, do nothing.
          if (stat == 4 || (cookieData[id] == 0 || (stat == 3 && cookieData[id] == undefined))) {
            if (!$(this).find('a.active').size() || activePages === 1) {
              // Allow block content to assign class 'collapsiblock-force-open'
              // to it's content to force itself to stay open. E.g. useful if
              // block contains a form that was just ajaxly updated and should
              // be visible
              if (titleElt.target.hasClass('collapsiblock-force-open') || titleElt.target.find('.collapsiblock-force-open').size() > 0) {
                return;
              }
              $(titleElt).addClass('collapsiblockCollapsed');
              $(titleElt.target).hide();
            }
          }
          //Set id for Aria-controls
          this.target[0]['id'] = 'collapse-content-' + id;

          //Set tabindex so element is focusable
          $(this.target).attr('tabindex', '-1');

          // Set Aria-expanded for expanded defaults and following cookies processing
          if (stat == 5 || stat == 2) {
            if ( stat == 2 && $(this).is(".collapsiblockCollapsed")) {
              return; //Collapsed
            } else {
              $(this).find("a").attr('aria-expanded', true); //Expanded
            }
          }
        }
      });
    }

};

Backdrop.Collapsiblock.getCookieData = function () {
  if ($.cookie) {
    var cookieString = $.cookie('collapsiblock');
    return cookieString ? $.parseJSON(cookieString) : {};
  }
  else {
    return '';
  }
};


})(jQuery);
