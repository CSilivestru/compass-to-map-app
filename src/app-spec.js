var App = require('./app');
var createDomUtilMock = require('./mocks/domUtilMockCreator');

function createFakeApp(className) {
  var methods = [
    'start',
    'stop',
    'doWhenStalledForGivenTime'
  ];
  return jasmine.createSpyObj(className, methods);
}

describe('after app start', function() {

  var mockedDomUtil;
  var scrollApp;
  var deviceRotationApp;

  beforeEach(function() {
    mockedDomUtil = createDomUtilMock();
    scrollApp = createFakeApp('ScrollApp');
    deviceRotationApp = createFakeApp('DeviceRotationApp');
  });

  describe('and page was loaded', function() {

    beforeEach(function() {
      mockedDomUtil.onPageLoaded.andCallFake(function(fn) { fn(); });
    });

    it('should start the scroll app yet', function() {
      mockedDomUtil.hasDeviceOrientation.andReturn(false);

      startApp();

      expect(scrollApp.start).toHaveBeenCalled();
    });

    it('deviceorientation should not rotate yet', function() {
      mockedDomUtil.hasDeviceOrientation.andReturn(true);

      startApp();

      expect(deviceRotationApp.start).toHaveBeenCalled();
    });

    describe('switch back to scroll if deviceorientation stalled', function() {

      beforeEach(function() {
        mockedDomUtil.hasDeviceOrientation.andReturn(true);
        var stalledCallback;
        deviceRotationApp.doWhenStalledForGivenTime.andCallFake(function(timeout, cb) { stalledCallback=cb; });

        startApp();
        stalledCallback();
      });

      it('should switch after given interval', function() {
        expect(scrollApp.start).toHaveBeenCalled();
      });
      it('should disconnect the deviceorientation hook', function() {
        expect(deviceRotationApp.stop).toHaveBeenCalled();
      });
    });

  });

  describe('if page has not been loaded yet', function() {
    it('should not start the scroll app yet', function() {
      mockedDomUtil.hasDeviceOrientation.andReturn(false);

      startApp();

      expect(scrollApp.start).not.toHaveBeenCalled();
    });

    it('deviceorientation should not rotate yet', function() {
      mockedDomUtil.hasDeviceOrientation.andReturn(true);

      startApp();

      expect(deviceRotationApp.start).not.toHaveBeenCalled();
    });
  });

  function startApp() {
    var app = new App(mockedDomUtil, scrollApp, deviceRotationApp);
    app.start();
  }

});
