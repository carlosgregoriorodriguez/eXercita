        function setEditSection(hash) {
            if (str = hash.match(/^#(\w+)/)) {
                var name = str[1];
                var editSection = $('#edit-' + name);
                if (editSection.length > 0) {
                    $('#edit-content>.show').removeClass('show');
                    editSection.addClass('show');
                    var height = editSection.height();
                    $('#edit-content').height(height);
                    $('#edit-bar a.selected').removeClass('selected');
                    $('#edit-bar a[href=#' + name + ']').addClass('selected');
                }
            }
        }
        $(window).hashchange(function () {
            var hash = location.hash;
            setEditSection(hash);
        });

        $(document).ready(function () {

            $("#document-preview-exercices").waypoint(function (event, direction) {
                $(this).parent().toggleClass('sticky', direction === "down");
                event.stopPropagation();
            });

            var $exercises = $('#document-preview-exercices .exercices');
            add = function (exercise) {
                checked = exercise.checked !== undefined ? exercise.checked : [];

                h = '<li id="exercise-' + exercise.id + '"><span class="position"></span><b>' + exercise.title + '</b><img class="delete" src="{{media_url("images/round_delete.png")}}" />';
                names = {
                    'hint': 'Pista',
                    'part': 'Apartado',
                    'solution': 'Solucion',
                    'example': 'Ejemplo'
                };
                $.each(exercise.sections, function (key, value) {
                    h += '<dl><dt>' + names[key] + '</dt>';
                    $.each(value, function (i, s) {
                        h += '<dd><input type="checkbox" name="' + s + '" value="' + s + '" ' + (($.inArray(s, checked) > -1) ? 'checked' : '') + '>' + s + '</dd>';
                    });
                    h += '</dl>';
                });

                h += '<div class="clear"></div></li>';
                $exercises.append(h);
            };

            $exercises.find('.delete').live('click', function () {
                $(this).parent().remove();
                if (!$exercises.find('li').length) {
                    $('#document-preview-exercices .noexercices').show();
                }
            });
            addMultiple = function (exercises) {
                $.each(exercises, function (index, exercise) {
                    add(exercise);
                });
            } { %
                if exercises %
            }
            addMultiple({
                {
                    exercises
                }
            }); { % endif %
            }

            function checkExercises() {
                exers = []
                $('#document-preview-exercices li').each(function () {
                    $$ = $(this);
                    a = $$.attr('id').slice('exercise-'.length);
                    checked = []
                    $$.find('input:checked').each(function () {
                        checked.push($(this).attr('name'));
                    });
                    if (checked.length > 0) {
                        a += '[' + checked.join(',') + ']';
                    }
                    exers.push(a);
                });
                return exers.join(';');
            }

            $('#document-form').submit(function () {
                $('#id_exercises').val(checkExercises());
            });

            var exercises = $('.exercise_list');
            var load_more = $('.load_more');

            function showResults(data, empty) {
                //console.log(data);
                if (empty) exercises.empty();
                $.each(data.exercises, function (index, exercise) {
                    elem = $('<li class="e" id="exercise-' + exercise.id + '"><h3>' + exercise.title + '</h3><a class="exercise-add"><span>Añadir</span></a><div class="s">' + exercise.description + '</div><div class="path">' + exercise.path + '</div></li>');
                    elem.find('.exercise-add').click(function (e) {

                        add(exercise);
                        updateExercices($("#document-preview-exercices .exercices"));
                    });
                    if (data.more) load_more.data('next', data.more).show();
                    else load_more.hide();
                    exercises.append(elem);
                });
            }
            var runningRequest = false;
            var request;
            var loader = $('#edit-exercices .loader');
            load_more.hide().click(function () {
                next = $(this).data('next');
                runningRequest = true;
                $.getJSON(next, function (data) {
                    loader.hide();
                    //alert(data.results);
                    //console.log(data.q);      
                    showResults(data);
                    runningRequest = false;
                });
                return false;
            });
            //Identify the typing action
            $('input#instant-exercices').keyup(function (e) {

                loader.show();
                //Abort opened requests to speed it up
                if (runningRequest) {
                    request.abort();
                }

                runningRequest = true;
                request = $.getJSON("{{url('exercises_list_json')}}", {
                    q: $(this).val()
                }, function (data) {
                    loader.hide();
                    //alert(data.results);
                    //console.log(data.q);      
                    showResults(data, true);
                    runningRequest = false;
                });
            });

            if (location.hash != '') setEditSection(location.hash);
            else setEditSection('#basic');

            $(".defaultText").focus(function (srcc) {
                if ($(this).val() == $(this)[0].title) {
                    $(this).removeClass("defaultTextActive");
                    $(this).val("");
                }
            });

            $(".defaultText").blur(function () {
                if ($(this).val() == "") {
                    $(this).addClass("defaultTextActive");
                    $(this).val($(this)[0].title);
                }
            });

            $(".defaultText").blur();

            //alert('a');
            //$('#edit-content').height($('#edit-basic').css({opacity:1,display:'block'}).height());
            //$('#prueba').tooltip({ effect: 'slide',position: 'center right',direction:'right',predelay:600}).dynamic({left: { direction: 'left',position:'center left'}})    ;
            var noExercices = $("#document-preview-exercices .noexercices");
            var updateExercices = function (ul) {
                    var children = ul.children();
                    if (children.length == 0) {
                        noExercices.show();
                        ul.hide();
                    } else {
                        noExercices.hide();
                        ul.show();
                    }
                    var position = children.each(function () {
                        var $$$ = $(this);
                        var index = children.index($$$) + 1;
                        $$$.find('span').html(index);
                    })
                };

            $("#document-preview-exercices .exercices").sortable({
                axis: 'y',
                distance: 5,
                cursor: 'move',
                update: function (event, ui) {

                    updateExercices($(ui.item).parent());
                }
            });

            updateExercices($("#document-preview-exercices .exercices"));


        });