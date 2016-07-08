/**
 * Created by flip on 08.07.16.
 */

var events = {};
var selectedCategories = [];

function seteventbuttonListeners() {
    $('.edit').on('click', function (event) {
        entryid = $(event.target).attr('entryid');

        $('#modalevent_id').val(entryid);
        $('#modalevent_titel').val(events[entryid].title);
        $('#modalevent_location').val(events[entryid].location);
        $('#modalevent_email').val(events[entryid].organizer);
        $('#modalevent_start').val(events[entryid].start);
        $('#modalevent_end').val(events[entryid].end);
        $('#modalevent_status').val(events[entryid].status);
        $('#modalevent_allday').value = events[entryid.allday];
        $('#modalevent_url').val(events[entryid].webpage);

        //clear categories
        $("#modalevent_categories :selected").removeAttr("selected");
        selectedCategories = [];

        //set categories
        $.each(events[entryid].categories, function (key, val) {
            cat = $("#modalevent_categories  option[id=" + val.id + "]");

            console.log(cat);
            console.log("select " +val.id);


            //is categorie is missing? (was created after get the side and before open the modal) -> add to list
            if(cat == undefined) {
                $('#modalevent_categories').append('<option id="' + val.id + '"> ' + val.name + '</option>');
                cat = $("#modalevent_categories  option[id=" + val.id + "]");
            }

            cat.prop('selected', true);
            //document.getElementById().setAttribute("class", "democlass");
            selectedCategories.push(String(val.id));
        });

        $('#calendarentry').show();
    });

    $('.deletecat').on('click', function (event) {
        eventid = $(event.target).attr('entryid');

        $.ajax({
            type: 'DELETE',
            url: "http://dhbw.ramonbisswanger.de/calendar/" + user + '/events/' + eventid
        }).done(function (data) {

            if (data.success == true) {
                delete events[$(event.target).attr('entryid')];
                $(".entry" + $(event.target).attr('entryid')).remove();

                new PNotify({
                    title: 'Delete',
                    text: "deleted!",
                    type: 'success'
                });
            }

        }).error(function (event) {
            data = $.parseJSON(event.responseText);
            if (data != undefined && data.error == true) {
                switch (data.code) {
                    default:
                        new PNotify({
                            title: 'Error',
                            text: data.description,
                            type: 'error'
                        });
                }
            }
        });
    });
}

function saveCategories(eventid)
{
    // each  arrayCat if not existing in selectedCategories -> add and pop from array
    $("#modalevent_categories :selected").each(function(){
        index = $.inArray( this.id, selectedCategories);

        if (index > -1)
        {
            selectedCategories.splice(index,1);
        }
        else
        {
            $.ajax({
                type: 'POST',
                url: "http://dhbw.ramonbisswanger.de/calendar/" + user + '/category-assignment/' + this.id + '/' + eventid
            }).error(function (event) {
                data = $.parseJSON(event.responseText);
                if (data != undefined && data.error == true) {
                    switch (data.code) {
                        default:
                            new PNotify({
                                title: 'Error',
                                text: data.description,
                                type: 'error'
                            });
                    }
                }
            });
        }
    });

    //if there are elements left in selectedCategories -> delete
    $.each(selectedCategories, function () {
        $.ajax({
            type: 'DELETE',
            url: "http://dhbw.ramonbisswanger.de/calendar/" + user + '/category-assignment/' + this + '/' + eventid
        }).error(function (event) {
            data = $.parseJSON(event.responseText);
            if (data != undefined && data.error == true) {
                switch (data.code) {
                    default:
                        new PNotify({
                            title: 'Error',
                            text: data.description,
                            type: 'error'
                        });
                }
            }
        });
    });
}

function loadEntrys() {
    $.getJSON("http://dhbw.ramonbisswanger.de/calendar/" + user + "/events", function (data) {
        $.each(data, function (key, val) {

            events[val.id] = val;

            var dstart = new Date(val.start);
            var dend = new Date(val.end);
            var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

            $('#content').append(
                '<div class="entry entry' + val.id + '"> ' +
                '<h3>Title: ' + val.title + '</h3>' +
                '<p>Start: ' + days[dstart.getDay()] + ' ' + dstart.toLocaleDateString() + '</p>' +
                '<p>End: ' + days[dend.getDay()] + ' ' + dend.toLocaleDateString() + '</p>' +
                '<button class="edit" entryid="' + val.id + '">Edit</button>' +
                '<button class="deletecat" entryid="' + val.id + '">Delete</button>' +
                '</div>');
        });

        seteventbuttonListeners();

    }).error(function (event) {
        data = $.parseJSON(event.responseText);
        if (data != undefined && data.error == true) {
            switch (data.code) {
                default:
                    new PNotify({
                        title: 'Error',
                        text: data.description,
                        type: 'error'
                    });
            }
        }
    });

    $('#modalevent_categories').empty();
    //fill modal select
    $.getJSON("http://dhbw.ramonbisswanger.de/calendar/" + user + "/categories", function (data) {
        $.each(data, function (key, val) {
            $('#modalevent_categories').append(
                '<option id="' + val.id + '"> ' +
                val.name +
                '</option>');
        });
    }).error(function (event) {
        data = $.parseJSON(event.responseText);
        if (data != undefined && data.error == true) {
            switch (data.code) {
                default:
                    new PNotify({
                        title: 'Error',
                        text: data.description,
                        type: 'error'
                    });
            }
        }
    });
}

$(document).ready(function () {
    loadEntrys();
    //MODAL
    $('#createentry').on('click', function () {
        $('#modalevent_titel').val('');
        $('#modalevent_location').val('');
        $('#modalevent_email').val('');
        $('#modalevent_start').val(new Date());
        $('#modalevent_end').val(new Date());
        //$('#modal_status');
        $('#modalevent_allday').value = false;
        $('#modalevent_url').val('');

        $('#calendarentry').show();
    });

    // When the user clicks on <span> (x), close the modal
    $('.close').on('click', function (event) {
        $(event.target.parentNode.parentNode).hide();
    });

    $('#editcategories').on('click', function () {

        $('#modalcat_categories').empty();
        //fill modal select
        $.getJSON("http://dhbw.ramonbisswanger.de/calendar/" + user + "/categories", function (data) {
            $.each(data, function (key, val) {
                $('#modalcat_categories').append(
                    '<option id="' + val.id + '"> ' +
                    val.name +
                    '</option>');
            });

            $('#modalcategories').show();
        }).error(function (event) {
            data = $.parseJSON(event.responseText);
            if (data != undefined && data.error == true) {
                switch (data.code) {
                    default:
                        new PNotify({
                            title: 'Error',
                            text: data.description,
                            type: 'error'
                        });
                }
            }
        });
    });

    //Add new Category
    $('#modalcat_addcat').on('click', function () {

        var catnew = $('#modalcat_new');

        if (catnew.val().length > 0) {
            $.ajax({
                type: 'POST',
                url: "http://dhbw.ramonbisswanger.de/calendar/" + user + '/categories',
                data: JSON.stringify({"name": catnew.val()})
            }).done(function (data) {

                //add to categories select
                if (data.success == true) {
                    $('#modalcat_categories').append(
                        '<option id="' + data.id + '"> ' +
                        catnew.val() +
                        '</option>');

                    new PNotify({
                        title: 'Save',
                        text: catnew.val() + " saved!",
                        type: 'success'
                    });

                    catnew.val('');
                }

            }).error(function (event) {
                data = $.parseJSON(event.responseText);
                if (data != undefined && data.error == true) {
                    switch (data.code) {
                        default:
                            new PNotify({
                                title: 'Error',
                                text: data.description,
                                type: 'error'
                            });
                    }
                }
            });
        }
    });

    //Delete Categorie
    $('#modalcat_deletecat').on('click', function () {

        $('#modalcat_categories :selected').each(function (key, val) {
            $.ajax({
                type: 'DELETE',
                url: "http://dhbw.ramonbisswanger.de/calendar/" + user + '/categories/' + val.id
            }).done(function (data) {

                //add to categories select
                if (data.success == true) {
                    $("#modalcat_categories  option[id=" + val.id + "]").remove();

                    new PNotify({
                        title: 'Delete',
                        text: val.text + " deleted!",
                        type: 'success'
                    });
                }

            }).error(function (event) {
                data = $.parseJSON(event.responseText);
                if (data != undefined && data.error == true) {
                    switch (data.code) {
                        default:
                            new PNotify({
                                title: 'Error',
                                text: data.description,
                                type: 'error'
                            });
                    }
                }
            });

        });
    });

    //Save/edit Event
    $('#modalevent_save').on('click', function (event) {

        //TODO: drigger field validation

        if (!($('#modalevent_status').val() == "Free" ||
            $('#modalevent_status').val() == "Busy" ||
            $('#modalevent_status').val() == "Tentative" )) {
            new PNotify({
                title: 'Error',
                text: "Status is not valid!",
                type: 'error'
            });
        }
        else {
            entryid = $('#modalevent_id').val();
            $('#modalevent_id').val("");


            if (entryid != undefined && entryid.length  > 0) {
                //update

                //TODO check if categories changed to events array...
                $.ajax({
                    type: 'PUT',
                    url: "http://dhbw.ramonbisswanger.de/calendar/" + user + '/events/' + entryid,
                    data: JSON.stringify({
                        "title": $('#modalevent_titel').val(),
                        "location": $('#modalevent_location').val(),
                        "organizer": $('#modalevent_email').val(),
                        "start": $('#modalevent_start').val(),
                        "end": $('#modalevent_end').val(),
                        "status": $('#modalevent_status').val(),
                        "allday": $('#modalevent_allday').checked,
                        "webpage": $('#modalevent_url').val()
                    })
                }).done(function (data) {

                    if (data.success == true) {

                        //save Event Cat relation
                        saveCategories(entryid);

                        //update global event array
                        events[data.id].title = $('#modalevent_titel').val();
                        events[data.id].location = $('#modalevent_location').val();
                        events[data.id].organizer = $('#modalevent_email').val();
                        events[data.id].start = $('#modalevent_start').val();
                        events[data.id].end = $('#modalevent_end').val();
                        events[data.id].status = $('#modalevent_status').val();
                        events[data.id].allday = $('#modalevent_allday').value;
                        events[data.id].webpage = $('#modalevent_url').val();

                        var dstart = new Date($('#modalevent_start').val());
                        var dend = new Date($('#modalevent_end').val());
                        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                        $(".entry" + data.id).remove();
                        $('#content').append(
                            '<div class="entry entry' + data.id + '"> ' +
                            '<h3>' + $('#modalevent_titel').val() + '</h3>' +
                            '<p>Start: ' + days[dstart.getDay()] + ' ' + dstart.toLocaleDateString() + '</p>' +
                            '<p>End: ' + days[dend.getDay()] + ' ' + dend.toLocaleDateString() + '</p>' +
                            '<button class="edit" entryid="' + data.id + '">Edit</button>' +
                            '<button class="deletecat" entryid="' + data.id + '">Delete</button>' +
                            '</div>');

                        seteventbuttonListeners();

                        $(event.target.parentNode.parentNode.parentNode.parentNode).hide();
                    }

                }).error(function (event) {
                    data = $.parseJSON(event.responseText);
                    if (data != undefined && data.error == true) {
                        switch (data.code) {
                            default:
                                new PNotify({
                                    title: 'Error',
                                    text: data.description,
                                    type: 'error'
                                });
                        }
                    }
                });
            }
            else {
                //new

                $.ajax({
                    type: 'POST',
                    url: "http://dhbw.ramonbisswanger.de/calendar/" + user + '/events',
                    data: JSON.stringify({
                        "title": $('#modalevent_titel').val(),
                        "location": $('#modalevent_location').val(),
                        "organizer": $('#modalevent_email').val(),
                        "start": $('#modalevent_start').val(),
                        "end": $('#modalevent_end').val(),
                        "status": $('#modalevent_status').val(),
                        "allday": $('#modalevent_allday').checked,
                        "webpage": $('#modalevent_url').val()
                    })
                }).done(function (data) {

                    if (data.success == true) {

                        //update global event array
                        if (events[data.id] == undefined) {
                            events[data.id] = {};
                        } else {
                            $(".entry" + data.id).remove();
                        }

                        //save Event Cat relation
                        saveCategories(data.id);

                        events[data.id].title = $('#modalevent_titel').val();
                        events[data.id].location = $('#modalevent_location').val();
                        events[data.id].organizer = $('#modalevent_email').val();
                        events[data.id].start = $('#modalevent_start').val();
                        events[data.id].end = $('#modalevent_end').val();
                        events[data.id].status = $('#modalevent_status').val();
                        events[data.id].allday = $('#modalevent_allday').value;
                        events[data.id].webpage = $('#modalevent_url').val();


                        var dstart = new Date($('#modalevent_start').val());
                        var dend = new Date($('#modalevent_end').val());
                        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                        $('#content').append(
                            '<div class="entry entry' + data.id + '"> ' +
                            '<h3>' + $('#modalevent_titel').val() + '</h3>' +
                            '<p>Start: ' + days[dstart.getDay()] + ' ' + dstart.toLocaleDateString() + '</p>' +
                            '<p>End: ' + days[dend.getDay()] + ' ' + dend.toLocaleDateString() + '</p>' +
                            '<button class="edit" entryid="' + data.id + '">Edit</button>' +
                            '<button class="deletecat" entryid="' + data.id + '">Delete</button>' +
                            '</div>');

                        seteventbuttonListeners();
                        $(event.target.parentNode.parentNode.parentNode.parentNode).hide();
                    }

                }).error(function (event) {
                    data = $.parseJSON(event.responseText);
                    if (data != undefined && data.error == true) {
                        switch (data.code) {
                            default:
                                new PNotify({
                                    title: 'Error',
                                    text: data.description,
                                    type: 'error'
                                });
                        }
                    }
                });
            }
        }
    });

});