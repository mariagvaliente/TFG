$(function(){
    window.previewHintApp = () => {
        var newwindow = window.open('hintAppWrapper','',
            'width='+screen.width*0.7+',height='+screen.height*0.7);
        newwindow.onbeforeunload = function () {
            // processing event here
            var score = newwindow.API_1484_11.GetValue("cmi.score.raw");
            var status = newwindow.API_1484_11.GetValue("cmi.success_status");
            console.log(status, score)
        }
    };
});