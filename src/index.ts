import axios from "axios";
import { parseStringPromise } from "xml2js";
import * as Forge from "node-forge";
import { URLSearchParams } from "url";

export interface KeyInfo {
	e: string;
	m: string;
	h: string;
}

export interface RawKeyInfo {
	nxaml: NXAML;
}

export interface NXAML {
	object: {
		string: {
			$: {
				name: string;
				value: string;
			};
		}[];
	}[];
}

export class NexonLogin {
	constructor(
		private readonly _userAgent: string = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
	) {}

	public async parseXML<T>(str: string): Promise<T> {
		const res = await parseStringPromise(str);
		return res;
	}

	public async getKeyInfo(): Promise<KeyInfo> {
		const res = (await axios("https://login.nexon.com/login/page/encryptinfo.aspx", { responseType: "text" })).data;
		const rawkeyInfo = await this.parseXML<RawKeyInfo>(res.split("'")[1]);

		let e = "";
		let m = "";
		let h = "";
		for (let i = 0; i < rawkeyInfo.nxaml.object[0].string.length; i++) {
			const name = rawkeyInfo.nxaml.object[0].string[i]["$"].name;
			const value = rawkeyInfo.nxaml.object[0].string[i]["$"].value;

			if (name === "e") e = value;
			else if (name === "m") m = value;
			else if (name === "h") h = value;
		}

		return {
			e,
			m,
			h
		};
	}

	public async encrypt(dataList: string[], keyInfo: KeyInfo): Promise<string> {
		let data = dataList[0] + "\\";

		for (let i = 1; i < dataList.length; i++) {
			data += Buffer.from(dataList[i]).toString("base64");
			if (i < dataList.length - 1) data += "\\";
		}

		const key = Forge.pki.rsa.setPublicKey(new Forge.jsbn.BigInteger(keyInfo.m, 16), new Forge.jsbn.BigInteger(keyInfo.e, 16));
		const encrypted = Buffer.from(key.encrypt(data, "RSAES-PKCS1-V1_5"), "ascii").toString("hex");

		return encrypted;
	}

	public async login(id: string, pw: string): Promise<{ success: false; redirect: string } | { success: true; cookies: string[] }> {
		const keyInfo = await this.getKeyInfo();
		const encrypted = await this.encrypt([keyInfo.h, id, pw], keyInfo);

		const res = await axios({
			method: "POST",
			url: "https://login.nexon.com/login/page/loginproc.aspx",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Referer: "https://nxlogin.nexon.com/",
				Origin: "https://nxlogin.nexon.com",
				"User-Agent": this._userAgent
			},
			responseType: "text",
			data: new URLSearchParams({
				strEncData: encrypted,
				codeRegSite: "0",
				isSLogin: "0",
				strRedirect: "https://www.nexon.com/Home/Game"
			}).toString()
		});

		if (!res.data.includes(`document.location.href = "https://www.nexon.com/Home/Game"`))
			return { success: false, redirect: res.data.split('document.location.href = "')[1].split('"')[0] };
		return { success: true, cookies: res.headers["set-cookie"] as string[] };
	}
}
