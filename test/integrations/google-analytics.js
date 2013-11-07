
describe('Google Analytics', function () {

  var analytics = require('analytics');
  var assert = require('assert');
  var equal = require('equals');
  var GA = require('integrations/lib/google-analytics');
  var sinon = require('sinon');
  var test = require('integration-tester');

  it('should have the right settings', function () {
    var ga = new GA.Integration();
    test(ga)
      .name('Google Analytics')
      .readyOnLoad()
      .global('ga')
      .global('_gaq')
      .global('GoogleAnalyticsObject')
      .option('anonymizeIp', false)
      .option('classic', false)
      .option('domain', 'none')
      .option('doubleClick', false)
      .option('enhancedLinkAttribution', false)
      .option('ignoreReferrer', null)
      .option('siteSpeedSampleRate', null)
      .option('trackingId', '')
      .option('trackNamedPages', true);
  });

  describe('Universal', function () {

    var ga;
    var settings = {
      anonymizeIp: true,
      domain: 'none',
      siteSpeedSampleRate: 42,
      trackingId: 'UA-27033709-12'
    };

    beforeEach(function () {
      analytics.use(GA);
      ga = new GA.Integration(settings);
    });

    afterEach(function () {
      ga.reset();
    });

    describe('#initialize', function () {
      beforeEach(function () {
        ga.load = sinon.spy();
      });

      it('should create window.GoogleAnalyticsObject', function () {
        assert(!window.GoogleAnalyticsObject);
        ga.initialize();
        assert('ga' === window.GoogleAnalyticsObject);
      });

      it('should create window.ga', function () {
        assert(!window.ga);
        ga.initialize();
        assert('function' === typeof window.ga);
      });

      it('should create window.ga.l', function () {
        assert(!window.ga);
        ga.initialize();
        assert('number' === typeof window.ga.l);
      });

      it('should call window.ga.create with options', function () {
        ga.initialize();
        assert(equal(window.ga.q[0], ['create', settings.trackingId, {
          cookieDomain: settings.domain,
          siteSpeedSampleRate: settings.siteSpeedSampleRate,
          allowLinker: true
        }]));
      });

      it('should anonymize the ip', function () {
        ga.initialize();
        assert(equal(window.ga.q[1], ['set', 'anonymizeIp', true]));
      });

      it('should call #load', function () {
        ga.initialize();
        assert(ga.load.called);
      });
    });

    describe('#load', function () {
      beforeEach(function () {
        sinon.stub(ga, 'load');
        ga.initialize();
        ga.load.restore();
      });

      it('should create window.gaplugins', function (done) {
        assert(!window.gaplugins);
        ga.load(function (err) {
          if (err) return done(err);
          assert(window.gaplugins);
          done();
        });
      });
    });

    describe('#track', function () {
      beforeEach(function () {
        ga.initialize();
        window.ga = sinon.spy();
      });

      it('should send an event', function () {
        ga.track('event');
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'All',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 0,
          nonInteraction: undefined
        }));
      });

      it('should send a category property', function () {
        ga.track('event', { category: 'Category' });
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'Category',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 0,
          nonInteraction: undefined
        }));
      });

      it('should send a label property', function () {
        ga.track('event', { label: 'label' });
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'All',
          eventAction: 'event',
          eventLabel: 'label',
          eventValue: 0,
          nonInteraction: undefined
        }));
      });

      it('should send a rounded value property', function () {
        ga.track('event', { value: 1.1 });
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'All',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 1,
          nonInteraction: undefined
        }));
      });

      it('should prefer a rounded revenue property', function () {
        ga.track('event', { revenue: 9.99 });
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'All',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 10,
          nonInteraction: undefined
        }));
      });

      it('should send a non-interaction property', function () {
        ga.track('event', { noninteraction: true });
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'All',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 0,
          nonInteraction: true
        }));
      });

      it('should send a non-interaction option', function () {
        ga.track('event', {}, { noninteraction: true });
        assert(window.ga.calledWith('send', 'event', {
          eventCategory: 'All',
          eventAction: 'event',
          eventLabel: undefined,
          eventValue: 0,
          nonInteraction: true
        }));
      });
    });

    describe('#page', function () {
      beforeEach(function () {
        ga.initialize();
        window.ga = sinon.spy();
      });

      it('should send a page view', function () {
        ga.page();
        assert(window.ga.calledWith('send', 'pageview', {
          page: undefined,
          title: undefined,
          url: undefined
        }));
      });

      it('should send a page properties', function () {
        ga.page('name', { url: 'url', path: '/path' });
        assert(window.ga.calledWith('send', 'pageview', {
          page: '/path',
          title: 'name',
          url: 'url'
        }));
      });
    });

  });

  describe('Classic', function () {

    var ga;
    var settings = {
      anonymizeIp: true,
      classic: true,
      domain: 'none',
      enhancedLinkAttribution: true,
      ignoreReferrer: ['domain.com', 'www.domain.com'],
      siteSpeedSampleRate: 42,
      trackingId: 'UA-27033709-5'
    };

    beforeEach(function () {
      analytics.use(GA);
      ga = new GA.Integration(settings);
    });

    afterEach(function () {
      ga.reset();
    });

    describe('#initializeClassic', function () {
      beforeEach(function () {
        ga.load = sinon.spy();
      });

      it('should create window._gaq', function () {
        assert(!window._gaq);
        ga.initialize();
        assert(window._gaq instanceof Array);
      });

      it('should push the tracking id', function () {
        ga.initialize();
        assert(equal(window._gaq[0], ['_setAccount', settings.trackingId]));
      });

      it('should set allow linker', function () {
        ga.initialize();
        assert(equal(window._gaq[1], ['_setAllowLinker', true]));
      });

      it('should set anonymize ip', function () {
        ga.initialize();
        assert(equal(window._gaq[2], ['_gat._anonymizeIp']));
      });

      it('should set domain name', function () {
        ga.initialize();
        assert(equal(window._gaq[3], ['_setDomainName', settings.domain]));
      });

      it('should set site speed sample rate', function () {
        ga.initialize();
        assert(equal(window._gaq[4], ['_setSiteSpeedSampleRate', settings.siteSpeedSampleRate]));
      });

      it('should set enhanced link attribution', function () {
        ga.initialize();
        assert(equal(window._gaq[5], ['_require', 'inpage_linkid', 'http://www.google-analytics.com/plugins/ga/inpage_linkid.js']));
      });

      it('should set ignored referrers', function () {
        ga.initialize();
        assert(equal(window._gaq[6], ['_addIgnoredRef', settings.ignoreReferrer[0]]));
        assert(equal(window._gaq[7], ['_addIgnoredRef', settings.ignoreReferrer[1]]));
      });

      it('should call #load', function () {
        ga.loadClassic = sinon.spy();
        ga.initialize();
        assert(ga.load.called);
      });
    });

    describe('#loadClassic', function () {
      beforeEach(function () {
        sinon.stub(ga, 'loadClassic');
        ga.initialize();
        ga.loadClassic.restore();
      });

      it('should replace window._gaq.push', function (done) {
        ga.loadClassic(function (err) {
          if (err) return done(err);
          assert(window._gaq.push !== Array.prototype.push);
          done();
        });
      });
    });

    describe('#trackClassic', function () {
      beforeEach(function () {
        ga.initialize();
        window._gaq.push = sinon.spy();
      });

      it('should send an event', function () {
        ga.trackClassic('event');
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'event', undefined, 0, undefined]));
      });

      it('should send a category property', function () {
        ga.trackClassic('event', { category: 'Category' });
        assert(window._gaq.push.calledWith(['_trackEvent', 'Category', 'event', undefined, 0, undefined]));
      });

      it('should send a label property', function () {
        ga.trackClassic('event', { label: 'label' });
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'event', 'label', 0, undefined]));
      });

      it('should send a rounded value property', function () {
        ga.trackClassic('event', { value: 1.1 });
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'event', undefined, 1, undefined]));
      });

      it('should prefer a rounded revenue property', function () {
        ga.trackClassic('event', { revenue: 9.99 });
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'event', undefined, 10, undefined]));
      });

      it('should send a non-interaction property', function () {
        ga.trackClassic('event', { noninteraction: true });
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'event', undefined, 0, true]));
      });

      it('should send a non-interaction option', function () {
        ga.trackClassic('event', {}, { noninteraction: true });
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'event', undefined, 0, true]));
      });
    });

    describe('#pageClassic', function () {
      beforeEach(function () {
        ga.initialize();
        window._gaq.push = sinon.spy();
      });

      it('should send a page view', function () {
        ga.pageClassic();
        assert(window._gaq.push.calledWith(['_trackPageview', undefined]));
      });

      it('should send a path', function () {
        ga.pageClassic(null, { path: '/path' });
        assert(window._gaq.push.calledWith(['_trackPageview', '/path']));
      });

      it('should send a named page event', function () {
        ga.options.trackNamedPages = true;
        ga.pageClassic('Name');
        assert(window._gaq.push.calledWith(['_trackEvent', 'All', 'Viewed Name Page', undefined, 0, true]));
      });
    });
  });

});