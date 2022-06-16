import axios from "axios";
import { NexonLogin } from "../src";

export interface Userinfo {
	nickname: string;
	memberSN: number;
}

export interface Message {
	count: number;
}

export interface Game {
	gameCode: number;
	name: string;
	url: string;
	imageUrl: string;
	type: number[];
	hide: boolean;
}

export interface RecentGames {
	games: Game[];
}

export interface GetUserInfoResult {
	userinfo: Userinfo;
	message: Message;
	recentGames: RecentGames;
}

async function getUserInfo(cookies: string[]): Promise<GetUserInfoResult> {
	const res: GetUserInfoResult = JSON.parse(
		(
			await axios(`https://gnbapi.nexon.com/myinfo/bar?callback=jsonpCallbackBar&_=${Date.now()}`, {
				headers: {
					Cookie: cookies.join("; "),
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
					referer: "https://user.nexon.com/"
				},
				responseType: "text"
			})
		).data
			.split("jsonpCallbackBar(")[1]
			.split(");")[0]
	);

	return res;
}

(async () => {
	const result = await new NexonLogin(
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
	).login("some powerful id", "some awesome password");
	if (!result.success) return console.log("Login Failed. Redirect:", result.redirect);

	console.log("UserInfo:", JSON.stringify(await getUserInfo(result.cookies), null, 2));
})();
