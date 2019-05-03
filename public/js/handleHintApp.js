$(function(){
    window.previewHintApp = () => {
        var newwindow = window.open('/escapeRooms/'+escapeRoomId+'/hintAppWrapper','',
            'width='+screen.width*0.7+',height='+screen.height*0.7);
        newwindow.onbeforeunload = function () {
            var score = newwindow.API_1484_11.GetValue("cmi.score.raw");
            var status = newwindow.API_1484_11.GetValue("cmi.success_status");
            if (newwindow.API_1484_11.GetValue("cmi.completion_status") === "completed") {
                fetch('/escapeRooms/'+escapeRoomId+'/requestHint', {
                    method: 'POST', 
                    body: JSON.stringify({status, score}), 
                    headers:{
                'Content-Type': 'application/json'
            }})
                .then(res=>{
                    return res.json();
                })
                .then(res => {
                    console.log(res);
                    alert(res.alert || res.msg);
                    if(res.ok) {
                        let listEl = document.createElement("li");
                        listEl.innerHTML= `
                            <div class="card border-info mb-3">
                                <div class="card-body">
                                    <div class="card-text">
                                         ${res.msg}
                                    </div>
                                </div>
                            </div>
                        `.trim();
                        document.getElementById("hintList").appendChild(listEl);
                    }
                    newwindow.close();

                })
                .catch(e=>{
                    console.error(e);
                    newwindow.close();
                });
            } else {
                newwindow.close();
            }
        }
    };
});