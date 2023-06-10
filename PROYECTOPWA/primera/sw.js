// imports
importScripts('js/sw-utils.js');

const STATIC_CACHE    = 'static-v1';
const DYNAMIC_CACHE   = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
    './',
    './index.html',        
    './css/estilos.css',
    './css/estilos.css.map',    
    './images/blog01.jpg',
    './images/blog02.jpg',
    './images/blog03.png',
    './images/logo2.png',
    './images/principal01.jpg',
    './images/servicio01.jpg',
    './images/servicio02.jpg',
    './images/servicio03.jpg',
    './images/servicio04.png',  
    './js/scripts.js',
    './js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap',        
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css',
    './css/bootstrap.min.css',
    './css/bootstrap.min.css.map',
    './css/normalize.css',
    './js/bootstrap.bundle.min.js',
    './js/bootstrap.bundle.min.js.map',
];



self.addEventListener('install', e => {


    const cacheStatic = caches.open( STATIC_CACHE ).then(cache => 
        cache.addAll( APP_SHELL ));

    const cacheInmutable = caches.open( INMUTABLE_CACHE ).then(cache => 
        cache.addAll( APP_SHELL_INMUTABLE ));



    e.waitUntil( Promise.all([ cacheStatic, cacheInmutable ])  );

});


self.addEventListener('activate', e => {

    const respuesta = caches.keys().then( keys => {

        keys.forEach( key => {

            if (  key !== STATIC_CACHE && key.includes('static') ) {
                return caches.delete(key);
            }

            if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
                return caches.delete(key);
            }

        });

    });

    e.waitUntil( respuesta );

});




self.addEventListener( 'fetch', e => {


    const respuesta = caches.match( e.request ).then( res => {

        if ( res ) {
            return res;
        } else {

            return fetch( e.request ).then( newRes => {

                return actualizaCacheDinamico( DYNAMIC_CACHE, e.request, newRes );

            });

        }

    });



    e.respondWith( respuesta );

});


