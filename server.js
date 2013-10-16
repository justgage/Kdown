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
   if (request.method == 'POST' || request.method == 'PUT') {
      var body = '';
      request.on('data', function(data) {
         body += data;
         // ~1MB - use something else for bigger files
         if (body.length > 1e6) {
            // Body is too long
            request.connection.destroy();
            callback(new Error('Body too big'));
         }
      });
      request.on('end', function() {
         var data = qs.parse(body);
         callback(null, data);
      });
   }
}

function run(request, response) {
   console.log("hit");
   request.setEncoding("utf8");
   postdata(request, response, function(err, data) {
      var reply; //used to send json back

      if (err) {
         console.log(err);
      } else {
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
               console.log(cat);
               reply = markets[data.market];
               reply.mess = "returning market " + data.market + 'cateogy ' + data.cat;
               reply.err = false;
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
   });
   //response.write(JSON.stringify(markets));
}

http.createServer(run).listen(8888);

console.log('Server started');
