// Let's register Template7 helper so we can pass json string in links
Template7.registerHelper('json_stringify', function (context) {
    return JSON.stringify(context);
});

// Export selectors engine
var $$ = Dom7;
var mainView ;


// Initialize your app
var myApp = new Framework7({
  debug: false,
  animateNavBackIcon: true,
// Enable templates auto precompilation
  precompileTemplates: true,
// Enabled pages rendering using Template7
  template7Pages: true,
  template7Data: {
        ncounter : {
          count: 10,
          total:100
              },
        about: {
                name: 'Michel',
                age: 62,
                position: 'Data Designer',
                company: 'xiligroup v 0.3',
                interests: ['garden', 'music', 'JavaScript', 'iMac', 'iOS apps', 'walk on snow']
              },
        'page:contacts': {
              email: 'contact@xiligroup.com',
              city: 'Lyon',
               country: 'Europe'
           }
      }
});


/*
$$(document).on('pageInit', function (e) { // fired when changing page
    var page = e.detail.page;
    // Code for About page
    if (page.name ) {
      myApp.alert('Here comes our index! ' + page.view );
    }
  });
*/
//var template_counter = document.getElementById('templateCounter').innerHTML; // keep counter script

var t7p4wpDataCount = localStorage.t7p4wpDataCount ? JSON.parse(localStorage.t7p4wpDataCount) : [0,0];

var uri = localStorage.t7p4wpDataURI ? localStorage.t7p4wpDataURI : 'http://michel-i5-imac.local:8888/wp_svn42/json/get_posts/';

function get_latest_posts() {
  //$$.getJSON('http://michel-i6-imac.local:8888/wp_svn42/json/get_posts/' , function (json, status, xhr) {
  // to manage errors (? better)
    $$.ajax ({
      url: uri,
      dataType: 'json',
      timeout:2500,
      success: function(json, status, xhr) {

        console.log('inside ' + status);

        if( status == 200 ) {
          Template7.data.posts = json['posts'];
          var index = -1;
          var ar_ID_to_index = {};
          var ar_ID = the_posts.map(function(a){index++; var nid = a['id']; ar_ID_to_index[nid] = index; });
          Template7.data.ID_to_index = ar_ID_to_index;

          localStorage.t7p4wpData = JSON.stringify(Template7.data.posts); // as in todo7 example

          Template7.data.counter = { count: json['count'], total_count: json['count_total'] };

          //var compiledTemplate = Template7.compile(template_counter);

          //$$('#posts_count').html(compiledTemplate(Template7.data.counter)); // not set in Safari of iPad but ok in WebApp (HTML5 iOS home screen)

          $$('#posts_count').html(Template7.templates.templateCounter(Template7.data.counter)); // automatically detected because precompile
          Template7.data.counter['saved'] = '*'; // to indicate local storage
          localStorage.t7p4wpDataCount = JSON.stringify(Template7.data.counter);

        } else {
            //
            console.log(xhr.status);
            console.log(xhr.response);
            console.log(xhr.responseText)
            console.log(xhr.statusText);
        }
      },

      error: function( jqXHR, status, error ) { // activated in iPad Safari as 200 ? w/o snd params
        console.log('error ' + jqXHR.statusText);
      }
  });
};
//console.log(typeof (localStorage.t7p4wpData));

if ( typeof (localStorage.t7p4wpData)  == 'undefined' || localStorage.t7p4wpData == '' ) {
    get_latest_posts();
} else {
    Template7.data.posts = JSON.parse (localStorage.t7p4wpData); // as in todo7 example
    var the_posts = Template7.data.posts;
    var index = -1;
    var ar_ID_to_index = {};
    var ar_ID = the_posts.map(function(a){index++; var nid = a['id']; ar_ID_to_index[nid] = index; });
    Template7.data.ID_to_index = ar_ID_to_index;
    Template7.data.counter = t7p4wpDataCount;
    //var compiledTemplate = Template7.compile(template_counter);
    //document.getElementById('posts_count').innerHTML = compiledTemplate(Template7.data.counter); // not set in Safari of iPad but ok in WebApp (HTML5 iOS home screen)
     $$('#posts_count').html(Template7.templates.templateCounter(Template7.data.counter));
}

// Add main View
mainView = myApp.addView('.view-main', {
    // Enable dynamic Navbar
    dynamicNavbar: true,
    domCache: true
});


$$('.popup').on('open', function () { // as in todo7 example
    $$('body').addClass('with-popup');
});
$$('.popup').on('opened', function () {
    $$(this).find('input[name="uri"]').focus();
    $$(this).find('input[name="uri"]').val(uri);

});
$$('.popup').on('close', function () {
    $$('body').removeClass('with-popup');
    $$(this).find('input[name="uri"]').blur().val('');
});

// Add URI
$$('.popup .edit-uri').on('click', function () {
    var uri = $$('.popup input[name="uri"]').val().trim();
    if (uri.length === 0) {
        return;
    }
    Template7.data.uri = uri;
    localStorage.t7p4wpDataURI = Template7.data.uri;
    myApp.closeModal('.popup');
});

// Select Pull to refresh content
var ptrContent = $$('.pull-to-refresh-content');

// On refresh
ptrContent.on('refresh', function (e) {
  // Emulate 1s loading
  setTimeout(function () {
  //console.log('refreshing');
    // Execute get_latest_posts to get new Posts
    get_latest_posts();

  myApp.pullToRefreshDone();
  }, 1000);
});

// Update app when manifest updated
// http://www.html5rocks.com/en/tutorials/appcache/beginner/
// Check if a new cache is available on page load.
window.addEventListener('load', function (e) {
    window.applicationCache.addEventListener('updateready', function (e) {
        if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            myApp.confirm('A new version of TP74WP is available. Do you want to load it right now?', function () {
                window.location.reload();
            });
        } else {
            // Manifest didn't changed. Nothing new to server.
        }
    }, false);
}, false);

