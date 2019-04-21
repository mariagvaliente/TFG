$(function(){
    window.previewHintApp = () => {
        var newwindow = window.open('/escapeRooms/'+escapeRoomId+'/hintAppWrapper','',
            'width='+screen.width*0.7+',height='+screen.height*0.7);
        newwindow.onbeforeunload = function () {
            // processing event here
            var score = newwindow.API_1484_11.GetValue("cmi.score.raw");
            var status = newwindow.API_1484_11.GetValue("cmi.success_status");

            fetch('/escapeRooms/'+escapeRoomId+'/requestHint', {method: 'POST', body: JSON.stringify({status,score}),headers:{
                'Content-Type': 'application/json'
            }})
                .then(res=>{
                    return res.json();
                }).then(res => {
                    console.log(res);
                    alert(res.msg)
                }).catch(e=>console.error(e));
        }
    };
});