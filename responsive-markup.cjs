function applyResponsiveMarkup($){
 if(!$('link[href="/assets/responsive.css"]').length)$('head').append('<link rel="stylesheet" href="/assets/responsive.css">');
 const hero=$('.lahore-hero-image img');if(!hero.length||hero.attr('src')!=='/assets/hero-lahore-fleet.png')$('link[data-hero-preload]').remove();
 if(hero.length&&hero.attr('src')==='/assets/hero-lahore-fleet.png'&&!hero.parent().is('picture'))hero.wrap('<picture></picture>').before('<source media="(max-width: 1279px)" srcset="/assets/hero-lahore-mobile.webp">');
 if(hero.length&&hero.attr('src')==='/assets/hero-lahore-fleet.png')hero.parent().find('source[media]').attr('media','(max-width:1279px)');
 if(hero.length&&hero.attr('src')==='/assets/hero-lahore-fleet.png'&&!hero.parent().find('source[type="image/webp"]').length)hero.before('<source type="image/webp" srcset="/assets/hero-lahore-desktop.webp">');
 if(hero.length&&hero.attr('src')==='/assets/hero-lahore-fleet.png'&&!$('link[data-hero-preload]').length)$('head').append('<link data-hero-preload rel="preload" as="image" type="image/webp" href="/assets/hero-lahore-mobile.webp" media="(max-width:1279px)"><link data-hero-preload rel="preload" as="image" type="image/webp" href="/assets/hero-lahore-desktop.webp" media="(min-width:1280px)">');
 if(hero.length&&hero.attr('src')!=='/assets/hero-lahore-fleet.png')hero.parent('picture').find('source').remove();
 const search=$('#search');
 if(search.length&&!search.find('#pickup-time').length){search.find('#pickup').closest('label').after('<label><span>PICK-UP TIME</span><input id="pickup-time" type="time" value="10:00" required></label>');search.find('#return').closest('label').after('<label><span>RETURN TIME</span><input id="return-time" type="time" value="10:00" required></label>');}
 return $;
}
module.exports={applyResponsiveMarkup};
