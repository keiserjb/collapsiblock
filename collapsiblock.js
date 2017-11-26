
(function($) {

  Drupal.Collapsiblock = Drupal.Collapsiblock || {};

  Drupal.behaviors.collapsiblock = {

    attach: function (context,settings) {
      var cookieData = Drupal.Collapsiblock.getCookieData();
      var slidetype = settings.collapsiblock.slide_type;
      var activePages = settings.collapsiblock.active_pages;
      var slidespeed = parseInt(settings.collapsiblock.slide_speed,10);
      $('.collapsiblock').once('collapsiblock', function () {
        var id = this.id.replace(/_/g, '-');
        var titleElt = $(this);
        if (titleElt.size()) {
          titleElt = titleElt[0];
          // Status values: 1 = not collapsible, 2 = collapsible and expanded,
          // 3 = collapsible and collapsed, 4 = always collapsed,
          // 5 = always expanded
          var stat = $(this).data('collapsiblock_action');
          if (stat == 1) {
            return;
          }

          titleElt.target = $(this).siblings().not($('.contextual-links-wrapper'));
          $(titleElt)
          .wrapInner('<a href="#' + id +'" role="link" />')
          .click(function (e) {
            e.preventDefault();  
            var st = Drupal.Collapsiblock.getCookieData();
            if ($(this).is('.collapsiblockCollapsed')) {
              $(this).removeClass('collapsiblockCollapsed');
              if (slidetype == 1) {
                $(this.target).slideDown(slidespeed).attr('aria-hidden', false);
              }
              else {
                $(this.target).animate({
                  height:'show',
                  opacity:'show'
                }, slidespeed);
              }

              // Don't save cookie data if the block is always collapsed.
              if (stat != 4) {
                st[id] = 1;
              }
            }
            else {
              $(this).addClass('collapsiblockCollapsed');
              if (slidetype == 1) {
                $(this.target).slideUp(slidespeed).attr('aria-hidden', true);
              }
              else {
                $(this.target).animate({
                  height:'hide',
                  opacity:'hide'
                }, slidespeed);
              }

              // Don't save cookie data if the block is always collapsed.
              if (stat != 4) {
                st[id] = 0;
              }
            }
            // Stringify the object in JSON format for saving in the cookie.
            var cookieString = '{ ';
            var cookieParts = [];
            $.each(st, function (id, setting) {
              cookieParts[cookieParts.length] = ' "' + id + '": ' + setting;
            });
            cookieString += cookieParts.join(', ') + ' }';
            $.cookie('collapsiblock', cookieString, {
              path: settings.basePath
            });
          });
          $('a[role=link]', titleElt).click(function (e) {
            e.preventDefault();
          });
          // Leave active blocks if Remember collapsed on active pages is false.
          // If the block is expanded, do nothing.
          if (stat ==  4 || (cookieData[id] == 0 || (stat == 3 && cookieData[id] == undefined))) {
            if (!$(this).find('a.active').size() || activePages === 1) {
              // Allow block content to assign class 'collapsiblock-force-open' to it's content to force
              // itself to stay open. E.g. useful if block contains a form that was just ajaxly updated and should be visible
              if (titleElt.target.hasClass('collapsiblock-force-open') || titleElt.target.find('.collapsiblock-force-open').size() > 0) {
                return;
              }
              $(titleElt).addClass('collapsiblockCollapsed');
              $(titleElt.target).hide();
            }
          }
        }
      });
    }

  };

  Drupal.Collapsiblock.getCookieData = function () {
    if ($.cookie) {
      var cookieString = $.cookie('collapsiblock');
      return cookieString ? $.parseJSON(cookieString) : {};
    }
    else {
      return '';
    }
  };


})(jQuery);
