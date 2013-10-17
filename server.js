var http = require('http');
var qs = require('querystring');
var fs = require('fs');

var file = __dirname + '/files/info.json';

var markets; //holding the json


/***
 * this will read in the json file
 */
fs.readFile(file, 'utf8', function(err, data) {
   if (err) {
      console.log('Error: ' + err);
      return;
   }

   markets = JSON.parse(data);
});


/***
 * this will get the post information from a request
 */
function postdata(request, response, callback) {
   console.log('request on ' + request.method);
   if (request.method == 'POST' || request.method == 'PUT') {
      var body = '';
      request.on('data', function(data) {
         body += data;
         console.log('chunk:');
         console.log(data);
         // ~1MB - use something else for bigger files
         if (body.length > 1e6) {
            // Body is too long
            request.connection.destroy();
            callback(new Error('Body too big'));
            console.log('ERROR: sent too much data!');
         }
      });
      request.on('end', function() {
         console.log('Data recived!');
         var data = qs.parse(body);
         callback(null, data);
      });
   } else {
      response.end('{"error":true, "mess": "Need to send by POST/PUT"}');
   }
}

function run(request, response) {
   console.log("hit");
   request.setEncoding("utf8");
   postdata(request, response, function(err, data) {
      var reply = {}; //used to send json back

      console.log('Recived post data!');

      if (err) {
         console.log(err);
         response.end();
      } else {
         console.log('JSON from user:');
         console.log(JSON.stringify(data));

         // Both where sent
         if (typeof data.market !== 'undefined' && data.cat !== 'undefined') {
            var cats = markets[data.market].cats;
            var cat;
            //find it in the array
            for (var i = 0, l = cats.length; i < l; i++) {
               var c = cats[i];
               if (c.name === data.cat) {
                  cat = c;
               }
            }

            //cat was sent
            if (typeof cat !== 'undefined') {
               console.log('returning an cat\'s file list');
               console.log(cat);
               reply = markets[data.market];
               reply.mess = "returning market " + data.market + 'cateogy ' + data.cat;
               reply.err = false;
            } else {
               console.log('cat is invalid');
            }


         } else if (typeof data['all-list'] !== 'undefined') {
            console.log('getting a list of all oils.');
            //each market
            for (var market in markets) {
               if (market !== 'cat-list') {
                  //add the market
                  console.log(reply);
                  reply[market] = [];
                  var mcats = markets[market].cats;
                  //through each cat
                  for (var one_cat in mcats) {
                     //reply[market].push(mcats[one_cat].files);
                     var files = mcats[one_cat].files;
                     for (var j = 0, ll = files.length; j < ll; j ++) {
                        reply[market].push(files[j]);
                     }
                  }
               }
            }
            
         } else {
            console.log("No POST data, sending list of markets and categorys");
            var lists = {};
            lists.cats = markets['cat-list'];
            lists.markets = [];
            for (var m in markets) {
               if (m !== 'cat-list') {
                  lists.markets.push(m);
               }
            }

            reply = lists;
            reply.mess = "sending back list of markets and cats";
            reply.err = false;
         }
      }
      response.write(JSON.stringify(reply));
      response.end();
      console.log('request sent');
   });
   //response.write(JSON.stringify(markets));
}

http.createServer(run).listen(8888);

console.log('Server started');
