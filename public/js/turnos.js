const {$} = window;
const monthArray = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
];

const formatDate = (currentDate) => `${currentDate.getDate()} de ${monthArray[currentDate.getMonth()]}`; // + " de " + currentDate.getFullYear();
const getDashDate = function(currentDate) {
    return currentDate.getDate() + "-" + currentDate.getMonth() + "-" + currentDate.getFullYear();
}
const filterTurnos = (date) => {

    const turnos = $(".turno:not(.add-turno");

    turnos.addClass("hidden");
    turnos.each((index, turno) => {

        const $turno = $(turno);
        console.log($turno.data("date"))
        console.log(date)
        if ($turno.data("date") === date) {

            $turno.removeClass("hidden");

        }

    });

};

const updateDate = (date) => {
    console.log("update", date)
    date.setHours(0,0,0,0)
    $("#date").val(date);
    $("#currentDate").html(formatDate(date));
    filterTurnos(getDashDate(date));
    $("#start").focus();

};

const getQueryStringValue = (key) => decodeURIComponent(window.location.search.replace(new RegExp(`^(?:.*[&\\?]${encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&")}(?:\\=([^&]*))?)?.*$`, "i"), "$1"));


$(function () {

    $.datepicker.setDefaults({
        "firstDay": 1,
        "dayNamesMin": [
            "d",
            "l",
            "m",
            "m",
            "j",
            "v",
            "s"
        ],
        "monthNames": [
            "enero",
            "febrero",
            "marzo",
            "abril",
            "mayo",
            "junio",
            "julio",
            "agosto",
            "septiembre",
            "octubre",
            "noviembre",
            "diciembre"
        ],
        "monthNamesShort": [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sep",
            "Oct",
            "Nov",
            "Dic"
        ],
        "dayNamesShort": [
            "Dom",
            "Lun",
            "Mar",
            "Mié",
            "Juv",
            "Vie",
            "Sáb"
        ],
        "dayNames": [
            "Domingo",
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado"
        ],
        "isRTL": false,
        "showMonthAfterYear": false,
        "yearSuffix": "",
        "dateFormat": "dd/mm/yy",
        "closeText": "Cerrar",
        "prevText": "< Ant",
        "nextText": "Sig >",
        "currentText": "Hoy"

    });


    $.datepicker.setDefaults($.datepicker.regional.es);
    $("#datepicker").datepicker({
        "onSelect" () {

            const date = $("#datepicker").datepicker("getDate");

            updateDate(date);

        },
        "beforeShowDay" (date) {

            if ($.inArray(date.getTime(), window.selectedDates) !== -1) {

                return [
                    true,
                    "turn-day-highlight",
                    "¡Este día se celebra la Escape Room!"
                ];

            }

            return [
                true,
                "",
                ""
            ];

        }

    });
    const myDate = new Date(getQueryStringValue("date"));

    if (myDate && !isNaN(myDate.getDate())) {

        $("#datepicker").datepicker("setDate", new Date(myDate));

    }
    const date = $("#datepicker").datepicker("getDate");

    updateDate(date);

    $("#newForm").on("submit", function () {

        const dateSubmitted = new Date($("#date").val());
        const time = $("#start").val().
            split(":");

        dateSubmitted.setUTCHours(time[0]);
        dateSubmitted.setUTCMinutes(time[1]);
        $("#date").val(dateSubmitted);

        return true;

    });


});
