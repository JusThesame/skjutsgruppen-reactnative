#import <CoreLocation/CoreLocation.h>

#import <React/RCTBridge.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>

#import "GeoLocation.h"

@interface GeoLocation() <CLLocationManagerDelegate>
#define IS_OS_8_OR_LATER ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0)
#define IS_OS_10_OR_LATER ([[[UIDevice currentDevice] systemVersion] floatValue] >= 10.0)

@property (strong, nonatomic) CLLocationManager *locationManager;
@property CLLocation *lastLocation;

@end
@implementation GeoLocation

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

#pragma mark Initialization

- (instancetype)init
{
  if (self = [super init]) {
    self.locationManager = [[CLLocationManager alloc] init];
    
    self.locationManager.delegate = self;
    
    self.locationManager.distanceFilter = 5;
    self.locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters;
    self.locationManager.allowsBackgroundLocationUpdates = true;
    self.locationManager.pausesLocationUpdatesAutomatically = NO;
  }
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  double latitude = [defaults doubleForKey:@"latitude"];
  double longitude = [defaults doubleForKey:@"longitude"];
  NSLog(@"latitude: %f \t longitude: %f", latitude, longitude);
  return self;
}

RCT_REMAP_METHOD(checkGpsStatus,
                 findEventsWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSNumber *locationStatus = [NSNumber numberWithBool:[CLLocationManager locationServicesEnabled]==YES];
  resolve(locationStatus);
}

RCT_EXPORT_METHOD(showGpsSetting)
{
  NSLog(@"gotoSettings called");
  NSString* url = IS_OS_10_OR_LATER ? @"prefs:root=LOCATION_SERVICES" : @"App-Prefs:root=Privacy&path=LOCATION";
  dispatch_sync(dispatch_get_main_queue(), ^{
    NSLog(@"absc: %@",url);
    @try{
      bool status =  [[UIApplication sharedApplication] openURL:[NSURL URLWithString: url]];
      NSLog(@"openUrl status, %d", status);
    }@catch(NSException *ex){
      NSLog(@"%@", ex.reason);
    }
  });
}

RCT_REMAP_METHOD(startService,
                  startServiceResolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  CLAuthorizationStatus authorizationStatus= [CLLocationManager authorizationStatus];
  NSLog(@"location fetch started");
  if(authorizationStatus == kCLAuthorizationStatusDenied || authorizationStatus == kCLAuthorizationStatusRestricted){
    RCTLogInfo(@"authorizationStatus failed");
    reject(@"unauthorized", @"You are not authorized", nil);

    return;
    
    
  }
  if(IS_OS_8_OR_LATER) {
    RCTLogInfo(@"IOS 8 or later");
    [self.locationManager requestAlwaysAuthorization];
  }
  [self.locationManager startUpdatingLocation];
  resolve(@"start location update started");
}

RCT_REMAP_METHOD(stopService,
                  stopServiceResolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  CLAuthorizationStatus authorizationStatus= [CLLocationManager authorizationStatus];
  NSLog(@"location fetch started");
  if(authorizationStatus == kCLAuthorizationStatusDenied || authorizationStatus == kCLAuthorizationStatusRestricted){
    RCTLogInfo(@"authorizationStatus failed");
//    NSError *error = [NSERROR errorWithDomain:@"Unauthorized" code: -1 userInfo: nil];
    reject(@"unauthorized", @"You are not authorized", nil);
    return;
  }
  if(IS_OS_8_OR_LATER) {
    RCTLogInfo(@"IOS 8 or later");
    [self.locationManager requestAlwaysAuthorization];
  }
  [self.locationManager stopUpdatingLocation];
  resolve(@"location service stopped");
  
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
  NSLog(@"Location manager failed: %@", error);
}

- (void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations {
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  double latitude = [defaults doubleForKey:@"latitude"];
  double longitude = [defaults doubleForKey:@"longitude"];
  NSLog(@"before ========> latitude: %f ----- longitude: %f", latitude, longitude);
  NSLog(@"location update called: %@", locations);
  for (int i=0; i<locations.count; i++) {
    CLLocation *location = [locations firstObject];
    NSLog(@"location update called index:%d %@",i, location);
    if(_lastLocation==nil){
      _lastLocation = location;
      break;
    }
    if(_lastLocation != location)
      break;
  }
  NSDictionary *locationEvent = @{
                                  @"coords": @{
                                      @"latitude": @(_lastLocation.coordinate.latitude),
                                      @"longitude": @(_lastLocation.coordinate.longitude),
                                      @"altitude": @(_lastLocation.altitude),
                                      @"accuracy": @(_lastLocation.horizontalAccuracy),
                                      @"altitudeAccuracy": @(_lastLocation.verticalAccuracy),
                                      @"course": @(_lastLocation.course),
                                      @"speed": @(_lastLocation.speed),
                                      },
                                  @"timestamp": @([_lastLocation.timestamp timeIntervalSince1970] * 1000) // in ms
                                  };
  
  NSLog(@"after =====> %@: lat: %f, long: %f, altitude: %f", _lastLocation.timestamp, _lastLocation.coordinate.latitude, _lastLocation.coordinate.longitude, _lastLocation.altitude);
  
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"updateLocation" body:locationEvent];
  [defaults setDouble:_lastLocation.coordinate.latitude forKey:@"latitude"];
  [defaults setDouble:_lastLocation.coordinate.longitude forKey:@"longitude"];
  [defaults synchronize];}

@end

