var NgbDebug = new function __NgbDebug()
{
	this.Print = function ( Message )
	{
		alert( Message );
	}
}

function NgbEVMDelegator( /*function*/ _fn )
{
	try
	{
		this.fn = _fn;
	}
	catch( e ) 
	{
		NgbDebug.Print ( 'EVMDelegator Error!' );
	}
}

function __NgbCommand( _Type, _Command, _ArgForCommand )
{
	this.Type = _Type;
	this.Command = _Command;
	this.nExecuteCount = 0;
	this.ArgForCommand = _ArgForCommand;
	this.IsExecute = false;
	
	this.Execute = function( arg )
	{
		if( !this.IsExecute )
		{
			this.IsExecute = true;
			this.nExecuteCount++;

			var argument = new Array();
			argument[ 0 ] = arg;
			argument[ 1 ] = this.ArgForCommand;

			this.Command.fn.apply( this.Command.fn, argument );
			this.IsExecute = false;
		}
		else
		{
			NgbDebug.Print( "Excute Error" );
		}
	}	
}

function __NgbEvent( _Name )
{
	// State
	this.k_nEventState_notRaised = 1;
	this.k_nEventState_raised = 2;
	this.k_nEventState_paused = 3;
	this.k_nEventState_canceled = 4;

	this.k_nEventHandlingType_Handler = 1;
	this.k_nEventHandlingType_Command = 2;

	this.State = this.k_nEventState_notRaised;
	this.Name = _Name;
	this.arg = null;
	this.Command = new Array();
	
	this.RaiseEvent = function( arg )
	{
		this.State = this.k_nEventState_raised;
		this.arg = arg;
		this.Execute();
	}

	this.AddHandler = function( _Command, arg )
	{
		this.Command[ this.Command.length ] = new __NgbCommand( this.k_nEventHandlingType_Handler, _Command, arg );
		this.Execute();
	}
	
	this.AddCommand = function( _Command, arg )
	{
		this.Command[ this.Command.length ] = new __NgbCommand( this.k_nEventHandlingType_Command, _Command, arg );
		this.Execute();
	}
	
	this.Execute = function()
	{
		if( this.State == this.k_nEventState_raised )
		{
			for( var i = 0 ; i < this.Command.length ; i++ )
			{
				if( this.Command[ i ].Type == this.k_nEventHandlingType_Handler ||
					( this.Command[ i ].Type == this.k_nEventHandlingType_Command && this.Command[ i ].nExecuteCount == 0 ) )
					this.Command[ i ].Execute( this.arg );
			}
		}
	}
}

var NgbEVM = new function __NgbEVM()
{
	// Type
	this.k_nEventType_immediately = 0;
	this.k_nEventType_onPageStart = 1;
	this.k_nEventType_onPageEnd = 2;
	this.k_nEventType_onLoad = 3;
	this.k_nEventType_onUnload = 4;
	this.k_nEventType_onSubmit = 5;

	// For Auth Syste
	this.k_nEventType_onRefreshNoteBox = 6;
	
	this.Event = new Array();
	this.Event[ this.k_nEventType_immediately ]				= new __NgbEvent( "k_nEventType_immediately" );
	this.Event[ this.k_nEventType_onPageStart ]				= new __NgbEvent( "k_nEventType_onPageStart" );
	this.Event[ this.k_nEventType_onPageEnd ]				= new __NgbEvent( "k_nEventType_onPageEnd" );
	this.Event[ this.k_nEventType_onLoad ]					= new __NgbEvent( "k_nEventType_onLoad" );
	this.Event[ this.k_nEventType_onUnload ]					= new __NgbEvent( "k_nEventType_onUnload" );
	this.Event[ this.k_nEventType_onSubmit ]					= new __NgbEvent( "k_nEventType_onSubmit" );
	this.Event[ this.k_nEventType_onRefreshNoteBox ]			= new __NgbEvent( "k_nEventType_onRefreshNoteBox" );
	
	this.AddHandler = function( nEventType, delegator /*, argument list... */ )
	{
		var arg = new Array();
		for( var i = 2 ; i < arguments.length ; i++ )
			arg [ i - 2 ] = arguments[ i ];

		if( !isNaN( nEventType ) )
			this.Event[ nEventType ].AddHandler( delegator, arg );
		else
			NgbDebug.Print( 'Invalid Event Type : Event.AddHandler - ' + nEventType );
	}
	
	this.AddCommand = function( nEventType, delegator /*, argument list... */ )
	{
		var arg = new Array();
		for( var i = 2 ; i < arguments.length ; i++ )
			arg [ i - 2 ] = arguments[ i ];

		if( !isNaN( nEventType ) )
			this.Event[ nEventType ].AddCommand( delegator, arg );
		else
			NgbDebug.Print( 'Invalid Event Type : Event.AddCommand - ' + nEventType );
	}
	
	this.ReplaceEventHandlerHelper = function( /*function*/ fnEventHandler, /*string*/ strPreJavascriptCode, /*string*/ strPostJavascriptCode )
	{
		var strEventHandlerJavascriptCode = "";
		if ( fnEventHandler )
		{
			strEventHandlerJavascriptCode = fnEventHandler.toString();
			strEventHandlerJavascriptCode = strEventHandlerJavascriptCode.slice( strEventHandlerJavascriptCode.indexOf( "{" ) + 1, -1 );
		}
		
		return new Function( strPreJavascriptCode + strEventHandlerJavascriptCode + strPostJavascriptCode );
	}
	
	this.ReplaceEventHandler = function()
	{
		document.body.onload = this.ReplaceEventHandlerHelper( document.body.onload, "", "return NgbEVM.RaiseEvent( NgbEVM.k_nEventType_onLoad );" );
		document.body.onunload = this.ReplaceEventHandlerHelper( document.body.onunload, "", "return NgbEVM.RaiseEvent( NgbEVM.k_nEventType_onUnload );" );
	}
	
	this.GetEventTypeName = function( nEventType )
	{
		return this.Event[ nEventType ].Name;
	}
	
	this.RaiseEvent = function( nEventType )
	{
		try
		{
			NgbDebug.print( this.GetEventTypeName( nEventType ) );
		}
		catch( e ) {}
		
		var arg = new Array();
		for( var i = 1 ; i < arguments.length ; i++ )
			arg [ i - 1 ] = arguments[ i ];

		if( !isNaN( nEventType ) )
			this.Event[ nEventType ].RaiseEvent( arg );
		else
			NgbDebug.Print( 'Invalid Event Type : Event.RaiseEvent - ' + nEventType );
	}
}

var NgbCookie = new function __NgbCookie()
{
	this.GetCookie = function ( nameVal )
	{
		var numCookie = document.cookie.length;
		var oven = document.cookie.split( '; ' );
	
		for ( var i = 0; i < oven.length; i++ )
		{
			if ( oven[i].indexOf( '=' ) != -1 )
			{
				cookieName = oven[i].substring( 0, oven[i].indexOf( '=' ) );
			} else {
				cookieName = oven[i];
			}
	
			if ( cookieName == nameVal )
			{
				if ( oven[i].indexOf( '=' ) != -1 )
				{
					cookieVal = oven[i].substr( oven[i].indexOf( '=' ) + 1 );
				} else {
					cookieVal = '';
				}
				return cookieVal;
			}
		}
		return '';
	}
	
	this.setCookie_Permanent = function (nameVal, value, nameDomain)
	{
		if ( nameDomain == null || typeof( nameDomain ) == 'undefined' )
			nameDomain = "nexon.com";
		
		// 쿠키 저장 : Permanent Cookie --> 되도록이면 사용하지 마세요. 쿠키 꼬입니다... -_-;;;
		document.cookie = nameVal + "=" + escape(value) + ";expires=Thu, 30 Aug 2030 10:02:13 UTC; path=/; domain=" + nameDomain + ";";
	}
}

var NgbString = new function __NgbString()
{
	this.TrimStart = function ( word ) 
	{
		var wordLeng = word.length;
		var i;
		var pos, first, last;
	
		for(i = 0; i < wordLeng; i++) {
			if(word.charAt(i) != ' ') break;
		}
		pos = i;
		first = pos;
		last = wordLeng;
		word = word.substring(first,last);
		return word;
	}

	this.TrimEnd = function ( word ) 
	{
		var wordLeng = word.length;
		var i;
		var pos, first, last;
	
		for(i = wordLeng-1; i >= 0; i--) {
			if(word.charAt(i) != ' ') break;
		}
		pos = i;
		first = 0;
		last = pos + 1;
		word = word.substring(first,last);
		return word;
	}

	this.Trim = function ( word ) 
	{
		word = this.TrimStart( word );
		word = this.TrimEnd( word );
		return word;
	}

	this.TrimAll = function ( word ) 
	{
		var wordLeng = word.length;
		var i;
	
		for(i=0; i<wordLeng; i++) {
			word = word.replace(' ','');
		}
		return word;
	}
	
	this.IsEmpty = function ( strParam )
	{
		if( strParam == null )
			return true;
		else if( strParam == 'undefined' )
			return true;
		else if( this.TrimAll( strParam ) == '' )
			return true;
		else
			return false;
	}
	
	this.GetLengthToByte = function ( word )
	{
		var nValue = 0;
		
		for ( var i = 0; i < word.length; i ++ )
		{
			if ( word.charCodeAt( i ) > 255 )
				nValue += 2;
			else
				nValue ++;
		}
		
		return nValue;
	}
	
	this.CheckSpecialCharacter = function ( strValue ) 
	{ 
		var bReturn = true;
		
		for ( var nLoop = 0; nLoop < strValue.length; nLoop ++ )
		{
			var charValue = strValue.charAt( nLoop );
			
			if (( charValue >= 'A' && charValue <= 'Z') || ( charValue >= 'a' && charValue <='z'))
			{
				continue;//'영어';
			}
			else if ( charValue >= '0' && charValue <= '9')
			{
				continue;//'숫자';
			}
			else if ( charValue >= '\uAC00' && charValue <= '\uD7A3')
			{
				continue;//'한글';
			}
			else if ( charValue == ' ')
			{
				continue; // ' ' (space)
			}
			else
			{
				bReturn = false;//'즐
				break;				
			}
		}
		
		return bReturn;
	}
	
	this.CheckNumberOnly = function ( strValue ) 
	{ 
		var bReturn = true;

		for ( var nLoop = 0; nLoop < strValue.length; nLoop ++ )
		{
			var charValue = strValue.charAt( nLoop );
			
			if ( charValue < '0' || charValue > '9' )
			{
				bReturn = false;// 즐
				break;	
			}
		}

		return bReturn;
	}
	
	this.CheckNumberNAlphabetOnly = function ( strValue ) 
	{ 
		var bReturn = true;

		for ( var nLoop = 0; nLoop < strValue.length; nLoop ++ )
		{
			var charValue = strValue.charAt( nLoop );
			
			if (( charValue >= 'A' && charValue <= 'Z') || ( charValue >= 'a' && charValue <='z'))
			{
				continue;//'영어';
			}
			else if ( charValue >= '0' && charValue <= '9')
			{
				continue;//'숫자';
			}
			else
			{
				bReturn = false;//'즐
				break;				
			}
		}
		return bReturn;
	}
}

var NgbClientForm = new function __NgbClientForm()
{
	this.AddChildForSubform = function ( strName, strValue )
	{
		var objForm = document.getElementById( 'formLogin' );
		var objInput;
		try
		{
			objInput = eval( 'document.getElementById( "formLogin" ).' + strName );
			objInput.value = strValue;
		}
		catch( e )
		{
			var objInput		= document.createElement( 'input' );
			objInput.type		= 'hidden';
			objInput.name		= strName;
			objInput.value		= strValue;
			objForm.appendChild( objInput );
		}
	}

	this.SubmitFormWithTarget = function ( strURL , strTarget )
	{
		var objForm = document.formLogin;
		
		if( NgbString.Trim(strTarget) == '' )
			objForm.target = '_self';
		else
			objForm.target = strTarget;
		
		objForm.action = strURL;
		objForm.submit();
	}
	
	this.SubmitForm = function ( strURL )
	{
		this.SubmitFormWithTarget( strURL, '_self' );
	}
}

var NgbMember = new function __NgbMember()
{
	this.GoLoginPage = function( redirectUrl )
	{
		if( typeof( redirectUrl ) == "undefined" )
			redirectUrl = document.location.href;

		document.location.href = 'http://nxlogin.nexon.com/common/login.aspx?redirect=' + escape(redirectUrl);
		return false;
	}
	
	this.GoSLoginPage = function( redirectUrl )
	{
		if( typeof( redirectUrl ) == "undefined" )
			redirectUrl = document.location.href;

		document.location.href = 'http://nxlogin.nexon.com/common/login.aspx?type=simple&redirect=' + escape(redirectUrl);
		return false;
	}

	this.OpenUserProfile = function( oidUser )
	{
		var strURL = "http://www.nexon.com/profile/introduction.aspx?sn=" + oidUser ;
		window.open( strURL , 'UserProfile' ); 
		return false;
	}
		
	this.SearchNexonID = function( codeRegSite, strWiseLogParam )
	{
		var strURL = "https://member.nexon.com/find/findid.aspx";
		window.open( strURL , 'SearchID', 'scrollbars=no, resizable=no, width=610, height=620' ); 
		
		return false;
	}
	
	this.SearchPassword = function( codeRegSite, strWiseLogParam )
	{
		var strURL = "https://member.nexon.com/find/findpwd.aspx";
		window.open(strURL, 'SearchPass', 'scrollbars=no, resizable=no, width=610, height=620'); 
		
		return false;
	}
	
	this.GoRegisterPage = function( joinAccessCode, strWiseLogParam )
	{
		if ( typeof( joinAccessCode ) == 'undefined' )
			joinAccessCode = 196;

		window.open( "https://member.nexon.com/join/join.aspx?accesscode=" + joinAccessCode );
		
		return false;
	}
	
	this.GoCashReFillPage = function( )
	{
		if( NgbMember.IsLogin() )
		{
			if( NgbMember.IsMembership() )
				window.open( "https://member.nexon.com/cash/cashcharge.aspx" , 'CashCharge', 'width=530, height=516, resizable=no' ); 
			else
				window.open( "https://user.nexon.com/mypage/cash/cashcharge.aspx", 'CashCharge', 'width=530, height=516, resizable=no' ); 
		}
		else
		{
			NgbMember.GoLoginPage();
		}
		
		return false;
	}
	
	this.IsLogin = function()
	{
		if( NgbCookie.GetCookie( 'ENC' ) != '' && NgbCookie.GetCookie( 'NPP' ) != '' )
			return true;
		else
			return false;
	}
	
	this.IsMembership = function()
	{
		if( NgbCookie.GetCookie( "IM" ) == "1" )
			return true;
		else
			return false;
	}
	
	this.GoPersonalInfoPage = function( n4RenderType, strWiselogParam )
	{
		if( NgbMember.IsMembership() )
			location.href = "https://member.nexon.com/manage/changemyinfo.aspx"; 
		else
			location.href = "https://user.nexon.com/mypage/page/nx.aspx?url=myinfomanage/changemyinfo"; 
	}
	
	this.GoPrivacyPage = function()
	{
		var strURL = 'http://user.nexon.com/etc/pop_privacy.html?ST=nexon&PS=footer' ;
		window.open( strURL , 'Privacy', 'scrollbars=no, resizable=no, width=600, height=575' ); 
		
		// 멤버십에서는 접근이 없을것으로 예상되어 일단 페이지 추가하지 않음
	}
	
	this.GoStipulationPage = function()
	{
		var strURL = 'http://user.nexon.com/etc/pop_stipulation.html?ST=nexon&PS=footer' ;
		window.open( strURL , 'Stipulation', 'scrollbars=no, resizable=no, width=590, height=525' ); 
		
		// 멤버십에서는 접근이 없을것으로 예상되어 일단 페이지 추가하지 않음
	}
	
	this.GoInfo_ChildProtect = function( target, wiselog ) 
	{
		if( typeof( target ) == "undefined" )
			target = "_self";
			
		if( target == "_blank" )
			window.open( "https://member.nexon.com/policy/youthprotection.aspx", "GoInfo_ChildProtect" );
		else
			location.href = "https://member.nexon.com/policy/youthprotection.aspx";

	}
	
	this.GoInfo_RealName = function( target )
	{
		if( typeof( target ) == "undefined" )
			target = "_self";
			
		if( target == "_blank" )
			window.open( "https://member.nexon.com/policy/realname.aspx", "GoInfo_ChildProtect" );
		else
			location.href = "https://member.nexon.com/policy/realname.aspx";
	}
	
	this.GoInfo_UserInfo = function( target, wiselog )
	{
		if( typeof( target ) == "undefined" )
			target = "_self";
			
		if( target == "_blank" )
			window.open( "https://member.nexon.com/policy/privacy.aspx", "GoInfo_ChildProtect" );
		else
			location.href = "https://member.nexon.com/policy/privacy.aspx";
	}
	
	this.GoInfo_Stipulation = function( target, wiselog )
	{
		if( typeof( target ) == "undefined" )
			target = "_self";
		
		if( target == "_blank" )
			window.open( "https://member.nexon.com/policy/stipulation.aspx", "GoInfo_ChildProtect" );
		else
			location.href = "https://member.nexon.com/policy/stipulation.aspx";
	}
	
	this.GoInfo_SystemInfo = function( target )
	{
		if( typeof( target ) == "undefined" )
			target = "_self";
			
		if( target == "_blank" )
			window.open( "https://member.nexon.com/policy/systeminfo.aspx", "GoInfo_ChildProtect" );
		else
			location.href = "https://member.nexon.com/policy/systeminfo.aspx";
	}	
	
	this.BoardVerification = function( redirectUrl )
	{
		var popup = null;
		
		if( typeof( redirectUrl ) == "undefined" )
			redirectUrl = document.location.href;
		
		if( document.location.protocol == "https:" )
			popup = window.open( "https://member.nexon.com/html/pop_boardverification.html?redirect=" + escape( redirectUrl ), "BoardVerification", "scrollbars=no, resizable=no, width=423, height=394" ); 
		else
			popup = window.open( "http://member.nexon.com/html/pop_boardverification.html?redirect=" + escape( redirectUrl ), "BoardVerification", "scrollbars=no, resizable=no, width=423, height=394" );
			
		if( popup == null )
		{
			if( confirm( "게시판 글쓰기는 실명확인을 받은 계정에 한하여 이용 가능합니다.\n아래 [확인] 버튼을 클릭하신 후 실명확인을 완료해 주시기 바랍니다." ) )
				location.href = "https://member.nexon.com/verify/realname.aspx?redirect=" +  escape( redirectUrl );
		}
	}
	
	this.RealNameAuth = function( redirectUrl )
	{
		var popup = null;
		
		if( typeof( redirectUrl ) == "undefined" )
			redirectUrl = document.location.href;
		
		if( document.location.protocol == "https:" )
			popup = window.open( "https://member.nexon.com/html/pop_realname.html?redirect=" + escape( redirectUrl ), "RealNameAuth", "scrollbars=no, resizable=no, width=530, height=449" ); 
		else
			popup = window.open( "http://member.nexon.com/html/pop_realname.html?redirect=" + escape( redirectUrl ), "RealNameAuth", "scrollbars=no, resizable=no, width=530, height=449" ); 
			
		if( popup == null )
		{
			if( confirm( "현재 서비스는 실명확인을 받은 계정에 한하여 이용 가능합니다.\n아래 [확인] 버튼을 클릭하신 후 실명확인을 완료해 주시기 바랍니다." ) )
				location.href = "https://member.nexon.com/verify/realname.aspx?redirect=" +  escape( redirectUrl );
		}
	}
}

var NgbGameUser = new function __NgbGameUser()
{
	this.SearchGamePassword = function( maskGameCode )
	{
		if ( maskGameCode == 720896 )
			window.open( "https://user.nexon.com/member/page/nxpop.aspx?url=game/changepassword_ca", 'FindGamePwd_Popup', 'toolbar=no, location=no, scrollbars=no, resizable=no, width=488, height=500'); 
		else
			return false;
	}
}

var NgbNote = new function __NgbNote()
{
	this.OpenNotebox = function ( strNoteBoxURL, strWiseLogParam )
	{
		strNoteBoxURL = NgbString.IsEmpty( strNoteBoxURL ) ? 'http://message.nexon.com/notebox/list' : strNoteBoxURL;
		
		if ( !NgbString.IsEmpty( strWiseLogParam ) )
			strNoteBoxURL = strNoteBoxURL + strWiseLogParam;
		try
		{
			if( NgbMember.IsLogin() )
			{
				location.href = strNoteBoxURL;
			}
			else
			{
				NgbMember.GoLoginPage();
			}
		}
		catch( E )
		{
			window.open( strNoteBoxURL , memobox_target , 'width=640,height=480,toolbar=no,status=no,directories=no,scrollbars=no,location=no,resizable=no,menubar=no' );
		}
	}
	
	this.OpenNoteSend = function ( GameCode , ToCharacterName )
	{
		strNoteSendURL = 'http://message.nexon.com/nxcom/page/Gnx.aspx?URL=message/memo_send&maskGameCode=' + GameCode;
		if ( !NgbString.IsEmpty( ToCharacterName ) )
		{
			strNoteSendURL += '&strVirtualUserName=' + ToCharacterName;
		}
		
		if( NgbMember.IsLogin() )
		{
			window.open( strNoteSendURL , 'memo_send' , 'width=370,height=298,toolbar=no,status=no,directories=no,scrollbars=no,location=no,resizable=no,menubar=no' );
		}
		else
		{
			NgbMember.GoLoginPage();
		}
	}
}

var NgbReport = new function __NgbReport()
{
	this.OpenArticleReport = function ( GameCode, BoardSN, ArticleSN, BoardURL )
	{
		alert('요청하신 내용은 더 이상 지원되지 않습니다. 더 자세한 사항은 고객센터로 문의해주세요.\r\nhttp://help.nexon.com/');
	}
}

var NgbBrowser = new __NgbBrowser();
function __NgbBrowser()
{
	this.agt = navigator.userAgent.toLowerCase();
	this.check = function(browserName) { return this.agt.indexOf(browserName) != -1 };
	this.msie = function() { return this.check("msie") || this.check("trident") };
	this.msie5 = function() { return this.check("msie 5") };
	this.msie55 = function() { return this.check("msie 5.5") };
	this.msie6 = function() { return this.check("msie 6") };
	this.msie7 = function() { return this.check("msie 7") };
	this.msie8 = function() { return this.check("msie 8") };
	this.msie9 = function() { return this.check("msie 9") };
	this.msie10 = function() { return this.check("msie 10") };
	this.chrome = function() { return this.check("chrome") };
	this.firefox = function() { return this.check("firefox") };
	this.netscape = function() { return this.check("netscape") };
	this.safari = function() { return this.check("safari") };
	this.opera = function() { return this.check("opera") };
	this.gecko = function() { return this.check("gecko") };
	this.khtml = function() { return this.check("khtml") };
	this.windows = function() { return this.check("windows") };
	this.windows2000 = function() { return this.check("windows nt 5.0") };
	this.windowsXP = function() { return this.check("windows nt 5.1") };
	this.windows98 = function() { return this.check("windows 98") };
	this.mac = function() { return this.check("mac") };
	this.linux = function() { return this.check("linux") };
}

var NgbUrl = new function __NgbUrl()
{
	this.GetQueryString = function ( strQuery ) 
	{
		var strQueryString;
		var strHref = document.location.href.toLowerCase();
		strQuery = strQuery.toLowerCase();
		
		strQueryString = strHref.substr(strHref.indexOf("?")+1);
		strQueryString = "&" + strQueryString + "&";

		var n4Index = strQueryString.indexOf("&" + strQuery + "=");
		var tempValue ;
		
		strUrlString = document.location.href.substr(strHref.indexOf("?")+1);
		strUrlString = "&" + strUrlString + "&";
		
		if(n4Index == -1)
		{
			return "";
		}
		else
		{
			tempValue = strUrlString.substr(n4Index+1);
			tempValue = tempValue.substring(tempValue.indexOf("=")+1, tempValue.indexOf("&"));
			if( tempValue == "undefined")
				tempValue = "";
				
			tempValue = tempValue.replace("#","");
			return tempValue;
		}
	};
	this.SetQueryString = function ( url, strParam, strValue )
	{
		var blParam = false;
		var strHref = url.toLowerCase();
		var strTempURL = "";		
				
		if (( strParam != "" ) && ( strValue.toString() != "" )) 
		{			
			var strTempParam = "&" + strParam.toLowerCase() + "=";
			
			// if strParam Exists...
			if ( strHref.indexOf( strTempParam ) != -1 ) 
			{	
				var strTempQueryString = strHref.split( strTempParam );
				var strBaseURL = strTempQueryString[0];
				var strLastURL = strTempQueryString[1].substr(strTempQueryString[1].indexOf("&")+1);
									
				strTempURL = strBaseURL + strTempParam + strValue;
											
				if ( strLastURL.indexOf( "=" ) != -1 )
					strTempURL += "&" + strLastURL;
			} 
			else 
			{
				strTempURL = strHref + strTempParam + strValue;
			}
		}
						
		return strTempURL.toString();
	};
	
	this.Redirect = function ( url )
	{
		if ( url != "" )
		{
			document.location.href = url.toString();
		}
	};
	
	this.GetDomainURL = function ()
	{
		var url = location.href;
		var reg = /(.)+:\/\/([^\/\s]+)/i;
		var data = url.match(reg);
		return data[2];
 	};
}

var NgbAjax = new function __NgbAjax()
{
	this.NxRequest = new Array();
	this.nRequestCount = 0;

	this.GetAjaxObject = function ( nIndex ) 
	{
		if( window.ActiveXObject )
		{
			try 
			{
				this.NxRequest[ nIndex ] = new ActiveXObject( 'Msxml12.XMLHTTP' );
			} 
			catch( e ) 
			{
				try 
				{
					this.NxRequest[ nIndex ]= new ActiveXObject( 'Microsoft.XMLHTTP' );
				} 
				catch (e2) 
				{
					this.NxRequest[ nIndex ] = new XMLHttpRequest();	// IE 7.0
				}
			}
		} 
		else 
		{
			this.NxRequest[ nIndex ] = new XMLHttpRequest();
		}
	}
	
	this.AddRequest = function( objAjaxRequest )
	{
		var nIndex = this.nRequestCount;
		this.nRequestCount++;
		this.GetAjaxObject( nIndex );

		if( this.NxRequest[ nIndex ] )
		{
			this.NxRequest[ nIndex ].open( 'Post', objAjaxRequest.strURL + '?' + objAjaxRequest.GetQueryString(), true );
			this.NxRequest[ nIndex ].setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded; charset=ks_c_5601-1987' );
			this.NxRequest[ nIndex ].onreadystatechange = function() { objAjaxRequest.HandleReponse( nIndex ); } ;
			this.NxRequest[ nIndex ].send( objAjaxRequest.GetPostData() );
		}
	}
	
	
	this.AddAmlRequest = function( objAjaxRequest )
	{
		var nIndex = this.nRequestCount;
		this.nRequestCount++;
		this.GetAjaxObject( nIndex );

		if( this.NxRequest[ nIndex ] )
		{
			this.NxRequest[ nIndex ].open( 'Post', objAjaxRequest.strURL + '?' + objAjaxRequest.GetQueryString(), true );
			this.NxRequest[ nIndex ].setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded; charset=ks_c_5601-1987' );
			this.NxRequest[ nIndex ].onreadystatechange = function() { objAjaxRequest.HandleAmlReponse( nIndex ); } ;
			this.NxRequest[ nIndex ].send( objAjaxRequest.GetPostData() );
		}
	}
	
	this.RemoveRequest = function( nIndex )
	{
		this.NxRequest[ nIndex ] = null;
	}
}

function __NgbAjaxRequest( url )
{
	this.strURL = url;
	this.arrQueryString = new Array();
	this.arrPostData = new Array();
	this.Handler = null;
	
	this.HandleReponse = function( nIndex )
	{
		var xmlRequest =NgbAjax.NxRequest[ nIndex ];
		if( xmlRequest && xmlRequest.readyState == 4 && xmlRequest.status == 200 ) 
		{
			NgbAjax.RemoveRequest( nIndex );

			var responseText = xmlRequest.responseText;
			this.Handler( responseText );
		}
	}
	
	this.HandleAmlReponse = function( nIndex )
	{
		var xmlRequest =NgbAjax.NxRequest[ nIndex ];

		if( xmlRequest && xmlRequest.readyState == 4 && xmlRequest.status == 200 ) 
		{
			NgbAjax.RemoveRequest( nIndex );
                        try 
			{
			   var responseXML = xmlRequest.responseText;
			   var resultObject = NxamlParser.ParseXmlText( responseXML );
                        } 
			catch (e)
			{
				alert( '[XMLDoc Parse Error] ' + e.description );
			}
			this.Handler( responseXML, resultObject  );
		}
	}
	
	this.GetQueryString = function()
	{
		var strQueryString = '';
		if( this.strURL.indexOf( '?' ) != -1 )
			strQueryString = this.strURL.substr( this.strURL.indexOf( '?' ) );
			
		for( var i = 0 ; i < this.arrQueryString.length ; i++ )
		{
			if( strQueryString != '' )
				strQueryString += '&';
			
			strQueryString += this.arrQueryString[ i ].key + '=' +  this.arrQueryString[ i ].value;
		}
		
		return strQueryString;	
	}
	
	this.GetPostData = function()
	{
		var strPostData = '';

		for( var i = 0 ; i < this.arrPostData.length ; i++ )
		{
			if( strPostData != '' )
				strPostData += '&';
			
			strPostData += this.arrPostData[ i ].key + '=' +  this.arrPostData[ i ].value;
		}
		
		return strPostData;	
	}
	
	this.AddQueryString = function( key, value )
	{
		this.arrQueryString[ this.arrQueryString.length ] = { key:key, value:value };
	}
	
	this.AddPostData = function( key, value )
	{
		this.arrPostData[ this.arrPostData.length ] = { key:key, value:value };
	}
	
	this.AddHandler = function( handler )
	{
		this.Handler = handler;
	}
	
	this.Execute = function()
	{
		NgbAjax.AddRequest( this );
	}
	
	this.ExecuteAml = function()
	{
		NgbAjax.AddAmlRequest( this );
	}
}

var NgbUserEvent = new __NgbUserEvent();
function __NgbUserEvent()
{
	this.MousePositionX = function(evnt)
	{
		var LeftValue;
		if ( window.pageYOffset ) { LeftValue = window.pageXOffset; }
		else if ( document.documentElement && document.documentElement.scrollTop ) { LeftValue = document.documentElement.scrollLeft; }
		else if ( document.body ) { LeftValue = document.body.scrollLeft; }

		if(NgbBrowser.msie()) { return LeftValue + event.clientX; }
		else { return evnt.pageX; }
	};
	this.MousePositionY = function(evnt)
	{
		var TopValue;
		if ( window.pageYOffset ) { TopValue = window.pageYOffset;	}
		else if ( document.documentElement && document.documentElement.scrollTop ) { TopValue = document.documentElement.scrollTop; }
		else if ( document.body ) { TopValue = document.body.scrollTop; }

		if(NgbBrowser.msie()) { return TopValue + event.clientY; }
		else { return evnt.pageY;}
	};
	this.DetectKey = function( evnt )
	{
		if( NgbBrowser.msie() )
		{
			if( event.ctrlKey == true )
				return false;
			
			if ( event.keyCode == 27 )
				return false;
			
			if ( event.keyCode == 116 || ( event.ctrlKey && (event.keyCode == 78 || event.keyCode == 82) ) )
			{
        		event.keyCode= 1;
				return false;
			}
		}
		else
		{
			if( evnt.keyCode == 17 )	// ctrl key
				return false;
			
			if ( evnt.keyCode == 27 )
				return false;
			
			if ( evnt.keyCode == 116 || ( evnt.keyCode == 17 && ( evnt.keyCode == 78 || evnt.keyCode == 82 ) ) )
			{
        		evnt.keyCode = 1;
				return false;
			}
		}
	}
}

var NgbCache = new __NgbCache();
function __NgbCache() 
{
	//배열정의
	this.cacheObjArray = new Array();
	
	//Key Value(Cache array first value)정해주는 함수
	this.cacheObjNaming = function() {
		var cacheObjName = "";
		for( var i = 0 ; i < arguments.length ; i++ )
		{
			if( i != 0 )
				cacheObjName += "_";
			cacheObjName += arguments [ i ];
		}
		return cacheObjName;
	}
	
	//키 값에 따라 그 항목이 배열에 있는지 검사
	this.isCacheObj = function( tempObjNaming ) {
		if( this.cacheObjArray.length>0 )
		{
			for( var i = 0; i < this.ArrayCount; i++ )
			{
				if(this.cacheObjArray[i][0] == tempObjNaming )
				{
					isCacheObjArrayValue = this.cacheObjArray[i];
					return isCacheObjArrayValue;
				}
			}
		}
		else
		{
			return false;
		}
	}

	this.cacheObjInsert = function() {
		if(NgbCache.isCacheObj(arguments[0])) {
			if( this.cacheObjArray.length>0 )
			{
				for( var i = 0; i < this.ArrayCount; i++ )
				{
					if(this.cacheObjArray[i][0] == tempObjNaming )
					{
						for( var j = 0 ; j < arguments.length ; j++ )
						{
							this.cacheObjArray[i][j] = arguments[ j ];
						}
					}
				}
			}
			else
			{
				return false;
			}
		} else {
			this.cacheObjArray[this.ArrayCount] = new Array();
			for( var i = 0 ; i < arguments.length ; i++ )
			{
				this.cacheObjArray[this.ArrayCount][i] = arguments[ i ];
			}
			this.ArrayCount = this.cacheObjArray.length;
		}
	}
	
	this.cacheObjDel = function() {
		if(NgbCache.isCacheObj(arguments[0])) {
			if( this.cacheObjArray.length>0 )
			{
				for( var i = 0; i < this.ArrayCount; i++ )
				{
					if(this.cacheObjArray[i][0] == tempObjNaming )
					{
						isCacheObjArrayValue = this.cacheObjArray[i];
						this.cacheObjArray[i] = "";
					}
				}
			this.ArrayCount = this.cacheObjArray.length;
			}
			else
			{
				return false;
			}
		}
	}
	
	this.ArrayCount = 0;
}

var NgbSearchUtil = new function __NgbSearchUtil()
{
	this._MakeURL = function ( strSectionName, strSearchText )
	{
		if( this._IsValidSection( strSectionName ) == false )
		{
			strSectionName = 'total';
		}
			
		if( this._IsValidSearchText( strSearchText) == true)
		{
			var strURL = "http://search.nexon.com/search/page/nx.aspx?url=search/";
			strURL += strSectionName.toLowerCase();
			strURL += "&strSearchText=";
			strURL += escape(strSearchText);
			return strURL;
		}
		else
			return '';
	}

	this._IsValidSection = function ( strSectionName )
	{
		switch( strSectionName.toLowerCase() )
		{
			case 'total':
			case 'kplus':
			case 'gameweb':
			case 'gameweb_game':
			case 'channelfun':
			case 'guild':
			case 'guildweb':
			case 'image':
			case 'webzine':
				return true;
			default:
				return false;
		}
	}

	this._IsValidSearchText = function ( strSearchText )
	{
		if( strSearchText.length < 2 )
		{
			alert('검색어를 2글자 이상 입력하세요');
			return false;
		}

		return true;
	}

	this.OnSearch = function( strSectionName, strSearchText , strTargetFrame, strWiseLog)
	{
		var strURL = this._MakeURL( strSectionName, strSearchText );
		if( strURL != '' )
		{
			if( strWiseLog != null && typeof(strWiseLog) != "undefined" && strWiseLog != '' )
			{
				strURL = strURL + strWiseLog;	
			}
			
			if( strTargetFrame != null && typeof(strTargetFrame) != "undefined" && strTargetFrame != '' )
			{
				try
				{
					eval( strTargetFrame.toLowerCase().replace(/_/g, "") ).location.href = strURL;
					return;
				}
				catch(err) { }
			}
			
			window.open( strURL );
		}
	}
}


var NgbBannerManager = new function __NgbBannerManager()
{
	this.AddBanner = function ( divID, ID, width, height, domain )
	{
		NgbEVM.AddCommand( NgbEVM.k_nEventType_onPageEnd, new NgbEVMDelegator( NgbBannerManager.WriteBanner ), divID, ID, width, height, domain );
	}
	
	this.WriteBanner = function()
	{
		var divID = arguments [ 1 ][ 0 ];
		var ID = arguments [ 1 ][ 1 ];
		var width = arguments [ 1 ][ 2 ];
		var height = arguments [ 1 ][ 3 ];
		var domain = arguments [ 1 ][ 4 ];
		
		new __NgbBanner( divID, ID, width, height, domain ).Write();
	}
}

function __NgbBanner( divID, ID, width, height, domain )
{
	this.divID = divID;
	this.ID = ID;
	this.width = width;
	this.height = height;
	this.domain = domain;
	
	this.Write = function()
	{
		//alert(  this.GetIframeString() );
		document.getElementById( this.divID ).innerHTML = this.GetIframeString();
	}

	this.GetIframeString = function()
	{
		return '<IFRAME title="광고영역" id="' + this.divID + '_iframe" name="' + this.divID + '_iframe" tabindex=0 SRC="' + this.GetIframeSrc() + '" WIDTH=' + this.width + ' HEIGHT=' + this.height + ' NORESIZE SCROLLING="No" FRAMEBORDER="0" MARGINHEIGHT="0" MARGINWIDTH="0" allowTransparency="true"></IFRAME>';
	}
	
	this.GetIframeSrc = function()
	{
		var strIframeBaseURL = 'http://ad.nexon.com';
		if( document.location.href.toLowerCase().indexOf( "https://" ) == 0 ) 
		{
			strIframeBaseURL = 'https://ad.nexon.com';
		}
		
		if( this.ID == 'test' )
			return strIframeBaseURL + '/NetInsight/html/test/test/test@test';
		else if( this.ID == 'test2' )
			return strIframeBaseURL + '/NetInsight/html/test/test/test@ti';
		else if( this.domain != null && this.domain != '' )
			return strIframeBaseURL + '/NetInsight/html/nexon/' + this.domain + '/' + this.ID;
		else
			return strIframeBaseURL + '/NetInsight/html/nexon/www.nexon.com/' + this.ID;
	}
	
	this.AppendScript = function()
	{
		/*
		var script		= document.createElement( 'script' );
		
		script.src		= this.GetIframeString();
		script.type	= 'text/javascript';
		script.charset	= 'ks_c_5601-1987';
		
		document.getElementById( this.divID ).appendChild( script );
		*/
	}
}

var NgbGnbBanner = new function __NgbGnbBanner()
{
	this.strQueryString = '';
	this.Handler = null;
	
	this.GetBanner = function( n4CMSSN, n1PageSize, handler )
	{
		var strBannerPageURL = 'http://www.nexon.com/ajax/banner.aspx';
		if( document.location.href.toLowerCase().indexOf( "https://" ) == 0 )
			strBannerPageURL = 'https://www.nexon.com/ajax/banner.aspx';
			
		this.AddQueryString( 'n4CMSSN', n4CMSSN );
		this.AddQueryString( 'n1PageSize', n1PageSize );
		this.AddHandler( handler );
		this.AppendScript( strBannerPageURL + this.strQueryString );
	}
	
	this.AddQueryString = function( key, value )
	{
		if( this.strQueryString == '' )
		{
			this.strQueryString += '?' + key + '=' + value;
		}
		else
		{
			this.strQueryString += '&' + key + '=' + value;
		}
	}
	
	this.AddHandler = function( handler )
	{
		this.Handler = handler;
	}
	
	this.AppendScript = function( src )
	{
		var script		= document.createElement( 'script' );
		
		script.src		= src;
		script.type		= 'text/javascript';
		script.charset	= 'ks_c_5601-1987';
		
		document.getElementsByTagName( 'head' )[ 0 ].appendChild( script );
	}
	
	this.HandleResponse = function( responseXML )
	{
		var resultObject	= NxamlParser.ParseXmlText( responseXML );
		
		this.Handler( responseXML, resultObject );
	}
}

//기존파일 보존
var NgbSearchBar = new function __NgbSearchBar() 
{
	this._MakeURL = function ( strSectionName, strSearchText )
	{
		if( this._IsValidSection( strSectionName ) == false )
		{
			strSectionName = 'total';
		}
			
		if( this._IsValidSearchText( strSearchText) == true)
		{
			var strURL = "http://search.nexon.com/search/page/nx.aspx?url=search/";
			strURL += strSectionName.toLowerCase();
			strURL += "&strSearchText=";
			strURL += escape(strSearchText);
			return strURL;
		}
		else
			return '';
	}

	this._IsValidSection = function ( strSectionName )
	{
		switch( strSectionName.toLowerCase() )
		{
			case 'total':
			case 'kplus':
			case 'gameweb':
			case 'gameweb_game':
			case 'channelfun':
			case 'guild':
			case 'guildweb':
			case 'image':
			case 'webzine':
				return true;
			default:
				return false;
		}
	}

	this._IsValidSearchText = function ( strSearchText )
	{
		if( strSearchText.length < 2 )
		{
			alert('검색어를 2글자 이상 입력하세요');
			return false;
		}

		return true;
	}

	this.OnSearch = function( strSectionName, strSearchText , strTargetFrame, strWiseLog)
	{
		var strURL = this._MakeURL( strSectionName, strSearchText );
		if( strURL != '' )
		{
			if( strWiseLog != null && typeof(strWiseLog) != "undefined" && strWiseLog != '' )
			{
				strURL = strURL + strWiseLog;	
			}
			
			if( strTargetFrame != null && typeof(strTargetFrame) != "undefined" && strTargetFrame != '' )
			{
				try
				{
					eval( strTargetFrame.toLowerCase().replace(/_/g, "") ).location.href = strURL;
					return;
				}
				catch(err) { }
			}
			
			window.open( strURL );
		}
	}
}


var NptEventKeyCode = new function __NptEventKeyCode()
{
	this.CheckNumeric = function ( nkeyCode )
	{
		if ( ( nkeyCode >= 48 && nkeyCode <= 57 )		// 숫자키
			|| ( nkeyCode >= 96 && nkeyCode <= 105 )	// 숫자키패드
			)
		{
			return true;
		}
		
		return false;
	}
	
	this.CheckAlphabet = function ( nkeyCode )
	{
		if ( nkeyCode >= 65 && nkeyCode <= 90 )
		{
			return true;
		}
		
		return false;
	}
	
	this.CheckSpecialCharacter = function ( nkeyCode )
	{
		if ( ( nkeyCode >= 186 && nkeyCode <= 192 )		// 특수문자
			|| ( nkeyCode >= 219 && nkeyCode <= 222 )	// 특수문자
			)
		{
			return true;
		}
		
		return false;
	}
	
}

var NgbDisplay = new function __NgbDisplay()
{
	this.ShowElement = function( objID )
	{
		if( document.getElementById( objID ) )
			document.getElementById( objID ).style.display = "block";
	}

	this.HideElement = function( objID )
	{
		if( document.getElementById( objID ) )
			document.getElementById( objID ).style.display = "none";
	}	
	
	this.AppendHTML = function( objID, html, delay )
	{
		if( typeof( delay ) == 'undefined' )
		{
			if( document.getElementById( objID ) )
				document.getElementById( objID ).innerHTML = html;
		}
		else
		{
			if( document.getElementById( objID ) )
				document.getElementById( objID ).innerHTML = html;
			else
				window.setTimeout( function(){ NgbDisplay.AppendHTML( objID, html, delay )}, delay );
		}
	}
}

var NgbChanneling = new function __NgbChanneling()
{
	this.OpenCashChargeList = function( n1ChannelingCode )
	{
		var strDomainURL = '';
		
		switch( n1ChannelingCode )
		{
			case 1 : strDomainURL = 'http://nexon.game.daum.net'; break;
			
			default : strDomainURL = 'http://nexon.game.daum.net'; break;
		}
		
		var strURL = strDomainURL +'/common/member/page/nxpop.aspx?url=myinfomanage/cashchargelist&n1ChannelingCode=' + n1ChannelingCode ;
		window.open( strURL , 'CashChargeList', 'scrollbars=no, resizable=no, width=500, height=440' ); 
		return false;
	}
	this.OpenCashUseList = function( n1ChannelingCode )
	{
		var strDomainURL = '';
		
		switch( n1ChannelingCode )
		{
			case 1 : strDomainURL = 'http://nexon.game.daum.net'; break;
			
			default : strDomainURL = 'http://nexon.game.daum.net'; break;
		}
		
		var strURL = strDomainURL + '/common/member/page/nxpop.aspx?url=myinfomanage/cashuselist&n1ChannelingCode=' + n1ChannelingCode ;
		window.open( strURL , 'CashUseList', 'scrollbars=no, resizable=no, width=500, height=440' ); 
		return false;
	}
	this.OpenConfigure = function( n1ChannelingCode )
	{
		var strDomainURL = '';
		var strURL = '';
		
		if ( n1ChannelingCode == 1 )
		{
			strURL = 'http://nexon.game.daum.net/common/member/page/nxpop.aspx?url=myinfomanage/openconfigure&n1ChannelingCode=' + n1ChannelingCode ;
		}
		else if ( n1ChannelingCode == 3 )
		{
			strURL = 'https://nxgamechanneling.tooniland.com/manage/openconfig.aspx';
		}
		
		window.open( strURL , 'OpenConfigure', 'scrollbars=no, resizable=no, width=400, height=270' ); 
		return false;
	}
	this.OpenMyPenaltyList = function( n1ChannelingCode, n4GameCode )
	{
		var strDomainURL = '';
		var strURL = '';
		
		if ( n1ChannelingCode == 1 )
		{
			strURL = 'http://nexon.game.daum.net/common/member/page/nxpop.aspx?url=help/mypenaltylist&n1ChannelingCode=' + n1ChannelingCode + '&n4GameCode=' + n4GameCode ;
		}
		else if ( n1ChannelingCode == 3 )
		{
			if ( n4GameCode == 94224 )
				strURL = 'https://nxgamechanneling.tooniland.com/elsword/help/warninglist.aspx';
			else
				strURL = 'https://nxgamechanneling.tooniland.com/elsword/help/warninglist.aspx';
		}
		
		window.open( strURL , 'MyPenaltyList', 'scrollbars=no, resizable=no, width=600, height=270' );
		return false;
	}		
	this.GoSecedePage = function( n1ChannelingCode, n4GameCode )
	{
		var strURL = 'https://nexon.game.daum.net/daum/member/page/nx.aspx?url=secede/secede&n4GameCode=' + n4GameCode ;
		location.href = strURL;
		return false;
	}	
	this.OpenServiceStipulation = function( n1ChannelingCode )
	{
		var strURL = 'http://nexon.game.daum.net/daum/stipulation/service_stipulation.html';
		window.open( strURL , 'ServiceStipulation', 'scrollbars=no, resizable=no, width=600, height=540' );
		return false;
	}
}