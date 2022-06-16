var NpfDebug = {
  IsDebugMode: false,
  TraceHandler: null,

  Trace: function (strMessage) {
    if (NpfDebug.IsDebugMode == true) {
      if (NpfDebug.TraceHandler != null) NpfDebug.TraceHandler(strMessage);
      else alert(strMessage);
    }
  },

  SetTraceHandler: function (handler) {
    NpfDebug.TraceHandler = handler;
  },

  RemoveTraceHandler: function (handler) {
    NpfDebug.TraceHandler = null;
  },
};

var NpfUtil = {
  GenerateKey: function () {
    return String(
      (new Date().getTime() % 1000000) * 100 + Math.floor(Math.random() * 100)
    );
  },

  URIEncode: function (text) {
    return escape(text);
  },

  EncodeXmlVisible: function (xmlText) {
    xmlText = xmlText.replace(/&/g, "&amp;");
    xmlText = xmlText.replace(/</g, "&lt;");
    xmlText = xmlText.replace(/>/g, "&gt;<br>");

    return xmlText;
  },
};

var NpfXmlLib = {
  LoadText: function (xmlText) {
    try {
      var parser = new DOMParser();
      if (parser != null) {
        var xmlDoc = parser.parseFromString(xmlText, "text/xml");
        return xmlDoc;
      }
    } catch (err) {
      var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      if (xmlDoc != null) {
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlText);
        return xmlDoc;
      }
    }
    NpfDebug.Trace("xml parser not exists");
    return null;
  },

  GetAttrValue: function (xmlElement, attrName) {
    if (xmlElement.attributes.getNamedItem(attrName) != null)
      return xmlElement.attributes.getNamedItem(attrName).value;
    return null;
  },
};

var NxamlParser = {
  ParseXmlText: function (xmlText) {
    var xmlDoc = NpfXmlLib.LoadText(xmlText);
    if (xmlDoc == null) {
      NpfDebug.Trace("NpfXmlLib.LoadText fail");
      return null;
    }

    return NxamlParser.ParseXmlDocument(xmlDoc);
  },

  ParseXmlDocument: function (xmlDocument) {
    var rootElement = xmlDocument.documentElement;

    if (rootElement == null) {
      NpfDebug.Trace("rootElement is null");
      return null;
    }

    if (rootElement.tagName != "nxaml") {
      NpfDebug.Trace("rootElement is not <nxaml>");
      return null;
    }

    return NxamlParser.ParseElement(rootElement);
  },

  ParseElement: function (xmlElement) {
    if (xmlElement.nodeType != 1) return null;

    if (xmlElement.tagName == "arr" || xmlElement.tagName == "array")
      return NxamlParser.ParseArray(xmlElement);
    else if (xmlElement.tagName == "str" || xmlElement.tagName == "string")
      return NxamlParser.ParseString(xmlElement);
    else if (xmlElement.tagName == "num" || xmlElement.tagName == "number")
      return NxamlParser.ParseNumber(xmlElement);
    else if (xmlElement.tagName == "bool" || xmlElement.tagName == "boolean")
      return NxamlParser.ParseBoolean(xmlElement);
    else if (
      xmlElement.tagName == "obj" ||
      xmlElement.tagName == "object" ||
      xmlElement.tagName == "nxaml"
    )
      return NxamlParser.ParseObject(xmlElement);
    // all other's are treated as an object
    else return NxamlParser.ParseObject(xmlElement);
  },

  ParseString: function (xmlElement) {
    var value = NpfXmlLib.GetAttrValue(xmlElement, "value");
    return value != null ? String(value) : "";
  },

  ParseNumber: function (xmlElement) {
    var value = NpfXmlLib.GetAttrValue(xmlElement, "value");
    return value != null ? Number(value) : 0;
  },

  ParseBoolean: function (xmlElement) {
    var value = NpfXmlLib.GetAttrValue(xmlElement, "value");
    if (value.toLowerCase() == "true") {
      return Boolean(1);
    } else {
      return Boolean(0);
    }
  },

  ParseObject: function (xmlElement) {
    var obj = new Object();
    var name;

    for (var i = 0; i < xmlElement.childNodes.length; ++i) {
      name = NpfXmlLib.GetAttrValue(xmlElement.childNodes[i], "name");
      if (name != null) {
        childObj = NxamlParser.ParseElement(xmlElement.childNodes[i]);
        if (childObj != null) eval("obj." + name + " = childObj;");
      }
    }

    return obj;
  },

  ParseArray: function (xmlElement) {
    var obj = new Array();

    for (var i = 0; i < xmlElement.childNodes.length; ++i) {
      childObj = NxamlParser.ParseElement(xmlElement.childNodes[i]);
      if (childObj != null) eval("obj[ " + obj.length + " ] = childObj;");
    }

    return obj;
  },
};

var NxamlLib = {
  CharSet: "ks_c_5601-1987",
  HandlerList: new Array(),
  ScriptList: new Array(),

  AppendScript: function (callbackSerial, src) {
    var script = document.createElement("script");

    script.src = src;
    script.type = "text/javascript";
    script.charset = NxamlLib.CharSet;

    var child = document.getElementsByTagName("head")[0].appendChild(script);

    NxamlLib.ScriptList[callbackSerial] = child;
  },

  RemoveScript: function (callbackSerial) {
    if (
      NxamlLib.ScriptList != null &&
      NxamlLib.ScriptList[callbackSerial] != null
    ) {
      document
        .getElementsByTagName("head")[0]
        .removeChild(NxamlLib.ScriptList[callbackSerial]);
      NxamlLib.ScriptList[callbackSerial] = null;
    }
  },

  AddHandler: function (callbackSerial, handler) {
    NxamlLib.HandlerList[callbackSerial] = handler;
  },

  ExecuteHandler: function (callbackSerial, resultObject, responseXML) {
    if (
      NxamlLib.HandlerList != null &&
      NxamlLib.HandlerList[callbackSerial] != null
    ) {
      NxamlLib.HandlerList[callbackSerial](resultObject, responseXML);
      NxamlLib.HandlerList[callbackSerial] = null;
    }
  },

  HandleResponse: function (responseXML) {
    var resultObject = NxamlParser.ParseXmlText(responseXML);

    if (resultObject != null && resultObject._cs != null) {
      NxamlLib.RemoveScript(resultObject._cs);
      NxamlLib.ExecuteHandler(resultObject._cs, resultObject, responseXML);
    }
  },

  // class XmlHttpMethod
  XmlHttpMethod: function (baseURL, methodName, callback) {
    this.callbackSerial = NpfUtil.GenerateKey();
    this.queryString = "?_vb=" + methodName + "&_cs=" + this.callbackSerial;

    this.AppendParam = function (name, value) {
      this.queryString += "&" + name + "=" + NpfUtil.URIEncode(value);
    };

    this.AppendStates = function (args, start) {
      for (var i = start; i < args.length; ++i) {
        var pos = args[i].indexOf("=");
        if (pos != -1)
          this.AppendParam(
            "__" + args[i].substr(0, pos),
            args[i].substr(pos + 1)
          );
      }
    };

    this.SendRequest = function () {
      NxamlLib.AddHandler(this.callbackSerial, callback);
      NxamlLib.AppendScript(this.callbackSerial, baseURL + this.queryString);
    };
  },
};

var NpfUrlLib = {
  ChannelingList: [
    ["nexon.com", "sso.nexon.com"],
    ["nexon.playnetwork.co.kr", "sso.nexon.playnetwork.co.kr"],
    ["nexon.game.naver.com", "sso.nexon.game.naver.com"],
  ],

  GetSSOUrl: function () {
    var commonurl = location.href;
    var pos;

    pos = commonurl.indexOf("://");
    if (pos >= 0) commonurl = commonurl.substr(pos + 3);

    pos = commonurl.indexOf("/");
    if (pos >= 0) commonurl = commonurl.substr(0, pos);

    for (var i = 0; i < NpfUrlLib.ChannelingList.length; ++i) {
      if (commonurl.indexOf(NpfUrlLib.ChannelingList[i][0]) >= 0) {
        commonurl = NpfUrlLib.ChannelingList[i][1];
        break;
      }
    }

    return (
      location.href.substr(0, location.href.indexOf("://") + 3) +
      commonurl +
      "/Ajax/Default.aspx"
    );
  },
};

var CommonError = {
  NoError: 0, // ~ 9999
};

var AuthSystemError = {
  Unknown: 20000, // ~ 29999
  NotInitialized: 20001,
  ServiceShutdown: 20002,
  NotAllowedLocale: 20003,
  DBCallFailed: 20004,
  SPException: 20005,
  WrongIDOrPassword: 20006,
  BlockedIp: 20007,
  TempBlockedByLoginFail: 20008,
  TempBlockedByWarning: 20009,
  BlockedByAdmin: 20010,
  AllocationFailed: 20011,
  InvalidNexonSN: 20012,
  SessionDataNotExist: 20013,
  InvalidUserIP: 20014,
  InvalidPassportKey: 20015,
  LockFailed: 20016,
  NexonIDMissmatched: 20017,
  Disconnected: 20018,
  NewSession: 20019,
  UmgdModuleCallFailed: 20020,
  NotAllowedServer: 20021,
  InvalidSessionKey: 20022,
  SoapCallFailed: 20023,
  InvalidArgument: 20024,
  UserNotExists: 20025,
  WrongPwd: 20026,
  WithdrawnUser: 20027,
  WrongOwner: 20028,
  InvalidAccount: 20034,
  InvalidHWID: 20050,
  InvalidChannelCode: 20056,
  GetSessionRepositoryError: 20070,
  SetSessionRepositoryError: 20071,
  ProtectedAccount: 20076,
  InvalidReferer: 20087,
  Deleted: 20089,
};

var AuthSystem = {
  UpdateSession: function (callback) {
    var method = new NxamlLib.XmlHttpMethod(
      NpfUrlLib.GetSSOUrl(),
      "UpdateSession",
      callback
    );
    method.SendRequest();
  },

  GetOldFashionInfo: function (callback) {
    var method = new NxamlLib.XmlHttpMethod(
      NpfUrlLib.GetSSOUrl(),
      "GetOldFashionInfo",
      callback
    );
    method.SendRequest();
  },

  GetPasswordHashKey: function (loginID, callback) {
    var method = new NxamlLib.XmlHttpMethod(
      NpfUrlLib.GetSSOUrl(),
      "GetPasswordHashKey",
      callback
    );
    method.SendRequest();
  },

  RequestQRCode: function (usageId, serviceId, callback) {
    var method = new NxamlLib.XmlHttpMethod(
      NpfUrlLib.GetSSOUrl(),
      "RequestQRCode",
      callback
    );
    method.AppendParam("usageId", usageId);
    method.AppendParam("serviceId", serviceId);
    method.SendRequest();
  },
};
