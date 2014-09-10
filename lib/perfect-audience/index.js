
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');

/**
 * Expose `PerfectAudience` integration.
 */

var PerfectAudience = module.exports = integration('Perfect Audience')
  .assumesPageview()
  .global('_pa')
  .option('siteId', '')
  .tag('<script src="//tag.perfectaudience.com/serve/{{ siteId }}.js">');

/**
 * Initialize.
 *
 * https://www.perfectaudience.com/docs#javascript_api_autoopen
 * 
 * http://support.perfectaudience.com/knowledgebase/articles/211506-step-1-install-the-site-tracking-tag
 *
 * @param {Object} page
 */

PerfectAudience.prototype.initialize = function(page){
  var total = track.total() || track.revenue();
  var orderId = track.orderId();
  var product = track.sku()
  
  window._pa = window._pa || {};
  
  if (orderId) window._pa.orderId = orderId;
  if (total) window._pa.revenue = total;
  if (product) window._pa.productId= product;
  
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

PerfectAudience.prototype.loaded = function(){
  return !! (window._pa && window._pa.track);
};

/**
 * Track.
 *
 * @param {Track} event
 */

PerfectAudience.prototype.track = function(track){
  window._pa.track(track.event(), track.properties());
};
