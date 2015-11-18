var Twit = require('twit');

var T = new Twit({
  consumer_key:         process.env.TWIT_CO_KEY,
  consumer_secret:      process.env.TWIT_CO_SECRET,
  access_token:         process.env.TWIT_ACC_TOKEN,
  access_token_secret:  process.env.TWIT_ACC_SECRET
});

var tweets = [];
var errors = [];

function postChoosenTweet(tweet){
  T.post('statuses/retweet/:id', { id: tweet.id }, function (err, data) {
    if (!data.errors) console.log('Logging:', 'Posted Tweet with ID: %s', tweet.id);
    if (data.errors && data.errors.length > 0) console.log('Error:', data.errors);
    if (data.errors[0].code === 327) {
      errors.push({error: 327, tweet: tweet.id});
      chooseMostRelevantTweet(true);
    }
  });
}

function chooseMostRelevantTweet(gotError) {
  var choosen = null;

  var yesterday = new Date(new Date().getDate() - 1);

  tweets.forEach(function(tweet){
    if (choosen === null || (tweet.prio>choosen.prio && new Date(tweet.date) > new Date(choosen.date) && new Date(tweet.date > yesterday))) {
      if (!gotError) choosen = tweet;
      if (gotError && errors.length > 0) {
        var tweetHasNoError = true;
        errors.forEach(function(err){
          if (err.tweet !== tweet.id) tweetHasNoError = true;
        });

        if (tweetHasNoError) choosen = tweet;
      }
    }
  });

  postChoosenTweet(choosen);
}

function checkTweets() {
  for (var i=0; i<tweets.length; i++) {
    tweets[i].prio = 0;

    if (tweets[i].name !== 'IDFRacing') tweets[i].prio += 75;

    if (tweets[i].message.indexOf('race') !== -1 || tweets[i].message.indexOf('quali') !== -1 || tweets[i].message.indexOf('qualifying') !== -1) tweets[i].prio += 35;

    if (tweets[i].message.indexOf('win') !== -1 || tweets[i].message.indexOf('result') !== -1) tweets[i].prio += 40;

    if (tweets[i].message.indexOf('wins') !== -1 || tweets[i].message.indexOf('results') !== -1) tweets[i].prio += 60;

    if (tweets[i].link !== undefined) tweets[i].prio += 20;

    if(i===tweets.length-1) chooseMostRelevantTweet();
  }
}

T.get('search/tweets', { q: 'from:@IDFracing OR from:@IGSAworldcup news OR result OR results OR win OR qualifying', result_type: 'recent'}, function(err, data) {
  var tw = data.statuses;

  for(var i = 0; i<tw.length; i++) {

    tweets.push({id: tw[i].id_str, name: tw[i].user.screen_name, date: tw[i].created_at, message: tw[i].text, link: tw[i].entities.urls[0].url, postLink: 'https://twitter.com/' + tw[i].user.screen_name + '/status/' + tw[i].id});

    if (i===tw.length-1) checkTweets();
  }
});
