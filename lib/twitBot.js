var TwitBot = function(config) {
  var options = {
    consumer_key:         config.consumer_key || process.env.TWIT_CO_KEY,
    consumer_secret:      config.consumer_secret || process.env.TWIT_CO_SECRET,
    access_token:         config.access_token || process.env.TWIT_ACC_TOKEN,
    access_token_secret:  config.access_token_secret || process.env.TWIT_ACC_SECRET
  }
};

TwitBot.prototype._validateConfig = function (config) {
  //check config for proper format
  if (typeof config !== 'object') {
    throw new TypeError('TwitBot config MUST be object, got ' + typeof config);
  }

  if (config.app_only_auth) {
    var auth_type = 'app-only auth';
    var required_keys = required_for_app_auth;
  } else {
    auth_type = 'user auth';
    required_keys = required_for_user_auth;
  }

  required_keys.forEach(function (req_key) {
    if (!config[req_key]) {
      var err_msg = util.format('Twit config must include `%s` when using %s.', req_key, auth_type)
      throw new Error(err_msg)
    }
  })
}
