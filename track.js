const axios = require("axios");
var fs = require("fs");

const promises = {};
async function callApi(trackId) {
  if (!trackId || trackId == "") {
    return null;
  }
  const url = `http://litped.com/article/thirdparty/logisticsInfo?kw=${trackId}`;
  console.log(`url: ${url}`);
  return await axios.get(url);
  //return url;
  // /console.log(promises[trackId]);
}

async function writeToFile(trackId, row) {
  let line = trackId;
  line += "," + row.datetime;
  line += "," + row.city;
  line += "," + row.stateCode;
  line += "," + `${row.detail}`;
  line += "\n";

  fs.appendFile("ndata.txt", line, function (err) {
    if (err) {
      console.error("coud not write");
    }
    console.log(`udpated ${trackId}`);
  });
}

(async () => {
  require("fs")
    .readFileSync("GCX.txt", "utf-8")
    .split(/\r?\n/)
    .forEach(function (trackId) {
      promises[trackId] = callApi(trackId);
    });

  for (const trackId in promises) {
    if (promises.hasOwnProperty(trackId)) {
      try {
	      const promise = promises[trackId];
	      if(!promise) continue;
 	      const response = await promise;
	      if (!response) {
	          fs.appendFile("error.txt", trackId + "\n", function (err) {
          	  });
	          continue;
              }
              const body = response.data;
              let found = false;
              if (body) {
                 const data = body.data;
                 if (data) {
	            if (data.trackingInfoDetail) {
                         const trackingInfoDetail = data.trackingInfoDetail;
                         if (trackingInfoDetail.length) {
                            const trackingInfo = trackingInfoDetail[0];
                            if (trackingInfo.rows && trackingInfo.rows.length) {
                               const row = trackingInfo.rows[0];
                               found = true;
                               writeToFile(trackId, row);
                            }
                         }
                    }
                 }
             }
             if (!found) {
                  fs.appendFile("error.txt", trackId + "\n", function (err) {
                  });
             }
      } catch (e) {
        console.log(e);
      }
    }
  }
})();
