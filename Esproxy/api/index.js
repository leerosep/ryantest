const Router = require('koa-router');
const api = new Router();
const bodyParser = require('koa-body');
const rp = require('request-promise')
const esClient = require('./client');


//const searchDoc = async function(indexName, mappingType, dataload){
//    return await esClient.search({
//        index: indexName,
////        type: mappingType,
//        body: dataload
//    });
//}
//
//module.exports = searchDoc;

async function fn_EsQuery(keyword){
  var retVal="";
  const body = {
    "query": {
        "match" : {
            "content" : "*"+keyword+"*"
        }
    },
    "_source": [ "content", "file", "path", "external" ]
  }
  try {
		const resp = await searchDoc('myindex', '', body);
    console.log("body========================+" + JSON.stringify(body));
    console.log(resp);

		var dataJsonArray = new Array();
			
    resp.hits.hits.forEach(function(hit){
    	console.log(hit._source.file.filename);
      var dataJson = new Object();
      //retVal += hit._source.file.filename+"\n=="+hit._source.file.extension+"\n=="+hit._source.external.description;
			dataJson.filename = hit._source.file.filename;
			dataJson.extension = hit._source.file.extension;
			dataJson.filepath = hit._source.external.description;

			dataJsonArray.push(dataJson);
    })

		var jsonRet = JSON.stringify(dataJsonArray);
		//	console.log(jsonRet);

  } catch (e) {
      console.log(e);
  }
  return jsonRet;
}



//	es search 
 api.get('/esa/:id', async (ctx, next) => {
 //  var aa = await fn_EsQuery(ctx.params.id);
//   console.log("\n----"+aa+"---\n");
var aa = ctx.params.id;
 	ctx.body = { message : aa };
 });

// api.all('/es', bodyParser(), (ctx, next) => {
//   console.log("\n post----"+ctx.request.body+"---\n");
//   console.log("\n post----"+ctx.params[0]+"---\n");
//   console.log("\n post----"+ctx.body+"---\n");
// });


api.post('/es', async (ctx, next) => {
console.log("es==================+++");
    console.log(ctx.request.body);
    var esResultObj = ctx.request.body;
    console.log(esResultObj.id); 
    
    var aa = await fn_EsQuery(esResultObj.id);
    console.log("\n----"+aa+"---\n");
    ctx.body = { message : aa };
  }
);
const createDoc = async function(indexName){
    return await esClient.create({
        index: indexName
    });
}


//	es index create
api.get('/escreate/:id', async (ctx, next) => {
	console.log("aa===="+ ctx.params.id);
	var indexName = ctx.params.id;
	esClient.initIndex(indexName);	

});

// es exists and create
api.post('/indexExists', async (ctx, next) => {
	console.log("=======================exists ==== "+ctx.request.body.userUuid);
//  console.log("aa===="+ ctx.params.id);
  var indexName = ctx.request.body.userUuid;
  var indexChk = await esClient.indexExists(indexName).then();
	if( indexChk == false){
		esClient.initIndex(indexName)
	}
	ctx.body = "t";
});



module.exports = api;
