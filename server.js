const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const R6API = require('r6api.js');

const app = express();

const aws = require('aws-sdk');

let s3 = new aws.S3({
	email: process.env.EMAIL,
	password: process.env.PASS,
});
app.use(cors());
app.use(bodyParser.json());
var all_info = {
	alllevel: null,
	allstats: null,
	latestseason: null,
};
async function api_acess(username, platform) {
	const r6api = new R6API(email, password);
	console.log(process.env.PASS);
	const id = await r6api.getId(platform, username).then((el) => el[0].userId);
	const stats = await r6api.getStats(platform, id).then((el) => el[0].pvp);
	const level = await r6api.getLevel(platform, id).then((el) => el[0].level);
	all_info.alllevel = level;
	all_info.allstats = stats;
	const season = await r6api
		.getRank(platform, id)
		.then((resp) => resp[0].seasons);
	const season_no = Number(Object.keys(season)[0]);
	var arr = [];
	for (var i = season_no; i > season_no - 3; i--) {
		arr.push(i);
	}
	const three_seasons = await r6api
		.getRank(platform, id, { seasons: arr }, { regions: ['apac'] })
		.then((resp) => resp[0].seasons);
	all_info.latestseason = three_seasons;
}
app.post('/profile', (req, res) => {
	const { username, platform } = req.body;
	api_acess(username, platform).then(() => {
		res.json(all_info);
	});
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.listen(process.env.PORT || 3000, () => {
	console.log(`app is running on port ${process.env.PORT}`);
});
