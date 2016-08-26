/* @ngInject */
export function LocalStorageFactory($window: angular.IWindowService) {

  var localStorage = $window.localStorage;
  var key = 'drpx.checkAccess';
  var value = 'true';

  var valid = false;
  try {
    localStorage.removeItem(key);
    localStorage.setItem(key, value);
    valid = value === localStorage.getItem(key);
  } catch (e) {}

  if (valid) {
    return localStorage;
  }

  var memoryStore = {};
  return {
    getItem(name) {
      return memoryStore[name] || null;
    },
    setItem(name, value) {
      memoryStore[name] = value;
    },
    removeItem(name,value) {
      delete memoryStore[name];
    }
  };

}
