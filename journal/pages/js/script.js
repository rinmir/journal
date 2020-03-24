function Disciplines(id, name)
{
    this.id = id;
    this.name = name;
}
function Pupils(id, surname, firstname, middlename)
{
    this.id = id;
    this.surname = surname;
    this.firstname = firstname;
    this.middlename = middlename;
}
function Marks(id, pupilID, disciplineID, rating){
    this.id = id;
    this.pupilID = pupilID;
    this.disciplineID = disciplineID;
    this.rating = rating;
}

function addToTable(t){
    if (t == 'disciplines') items[items.length] = new Disciplines(items.length + 1, $('#name').val());    
    else if (t == 'pupils') items[items.length] = new Pupils(items.length + 1, $('#surname').val(), $('#firstname').val(), $('#middlename').val());    
    localStorage.setItem(t, JSON.stringify(items));       
}

function loadTable(t){
    var table = $('#mainTable tbody');

    if (t == 'marks'){
        pupils = JSON.parse(localStorage.getItem('pupils'));
        disciplines = JSON.parse(localStorage.getItem('disciplines'));        

        if (pupils != null & disciplines != null)
        {
            var theadtr = $('<tr></tr>');
            theadtr.append('<th scope="row"></th>');
            for (let i = 0; i < disciplines.length; i++) 
                theadtr.append($('<th scope="row">' + disciplines[i].name + '</td>'));
            $('#mainTable thead').append(theadtr); 

            for (let a = 0; a < pupils.length; a++) {            
                theadtr = $('<tr id="pupilID'+ pupils[a].id +'"></tr>');
                var p = $('<th scope="row"></td>');
                p.text(pupils[a].surname + ' ' + pupils[a].firstname + ' ' + pupils[a].middlename);
                p.attr('onclick', 'showProgress('+ pupils[a].id +')');
                theadtr.append(p);
                showProgress
                for (let b = 0; b < disciplines.length; b++) 
                    theadtr.append($('<td class="dscpln text-center" id="' + disciplines[b].id + '" onclick="changeMarks('+ pupils[a].id +')">-</td>'));
    
                $('#mainTable').append(theadtr);
            }
        
            marks = JSON.parse(localStorage.getItem(t));

            if (marks != null) 
            for (let i = 0; i < marks.length; i++) {
                $('#pupilID' + marks[i].pupilID + ' .dscpln#' + marks[i].disciplineID).text(marks[i].rating);
            }
            else
            marks = [];

            calcAvg();
        }
        else
        {
            if (disciplines == null)
                $('main').append(
                    $('<p class="text-center text-danger col-6" id = "emptyWarning" style="font-size:xx-large;"></p>').append(
                    $('<div>Добавте <a href="/pages/disciplines.html">предметы</a></div>')
                    )
                )
            else if (pupils == null)
                $('main').append(
                    $('<p class="text-center text-danger col-6" id = "emptyWarning" style="font-size:xx-large;"></p>').append(
                    $('<div>Добавте <a href="/pages/pupils.html">учеников</a></div>')
                    )
                )
        }
    }
    else{
        items = JSON.parse(localStorage.getItem(t));
    
        if (localStorage.getItem(t) != null) {
            if (t == 'disciplines')
                for (let i = 0; i < items.length; i++) {
                    tr = $('<tr></tr>');
                    tr.append($('<th scope="row">'+ items[i].id +'</th>'));
                    tr.append($('<td>'+ items[i].name +'</td>'));
                    table.append(tr);
                }    
            else if (t == 'pupils')
                for (let i = 0; i < items.length; i++) {
                    tr = $('<tr></tr>');
                    tr.append($('<th scope="row">'+ items[i].id +'</td>'));
                    tr.append($('<td>'+ items[i].surname +'</td>'));
                    tr.append($('<td>'+ items[i].firstname +'</td>'));
                    tr.append($('<td>'+ items[i].middlename +'</td>'));
                    table.append(tr);
                }          
        }
        else   
        items = [];

        if (items.length > 0) $('#emptyWarning').remove();
    }
}

function changeMarks(pupilID){
    var i;
    for (i = 0; i < pupils.length; i++) 
        if (pupils[i].id == pupilID) break;
    $('#editing .modal-title #names').text(pupils[i].surname + ' ' + pupils[i].firstname + ' ' + pupils[i].middlename);

    var form = $('#editingForm'); 
    form.text("");
        for (let a = 0; a < disciplines.length; a++) {
            var div = $('<div class="d-block"></div>');

            var label = $('<label class="col-10"></label>');
            label.attr("for", 'disciplineID'+disciplines[a].id);
            label.text(disciplines[a].name);

            var input = $('<input type="text" size="1" pattern="[1-5]|-" required>');
            input.attr("id", "disciplineID" + disciplines[a].id);
            input.val('-');
            
            for (let b = 0; b < marks.length; b++) 
            if (marks[b].disciplineID == disciplines[a].id & marks[b].pupilID == pupilID){
                input.val(marks[b].rating);
                break;
            }

            div.append(label);
            div.append(input);            
            form.append(div);
            $('#editingForm').attr('onsubmit', 'submitMarks('+ pupilID +')')
        }     
    $('#editing').modal('show');
}

function submitMarks(pupilID){
    for (let a = 0; a < disciplines.length; a++){
        var check = false;
        var input = $('#editingForm #disciplineID'+ disciplines[a].id).val();
        {
            for (let b = 0; b < marks.length; b++) 
                if (disciplines[a].id == marks[b].disciplineID & pupilID == marks[b].pupilID)
                {
                    check = true;
                    marks[b].rating = input;
                }
            if (!check & input != '-')
                marks[marks.length] = new Marks(marks.length + 1, pupilID, disciplines[a].id, input);
        }
    }
    localStorage.setItem('marks', JSON.stringify(marks)); 
}

function calcAvg()
{    
    $('#mainTable thead tr').append(
        $('<th class="paddingless"></th>').append(
            $('<table class="avrTable table-sm"></table>')));
    $('#mainTable .avrTable').append($('<tr><td colspan="2">Средний балл</td></tr>'));
    $('#mainTable .avrTable').append($('<tr><td>С -</td><td>Без -</td></tr>'));

    for (let a = 0; a < pupils.length; a++) {
        var avgWith = 0;
        var countOf0 = 0;
        for (let b = 0; b < disciplines.length; b++) {
            var cur = $('#pupilID'+ pupils[a].id +' #'+ disciplines[b].id).text();
            if (cur == '-') countOf0++;
            else avgWith += Number(cur);
        }
        
        var avgWithout = 0;
        if (countOf0 != disciplines.length)
            avgWithout = avgWith / (disciplines.length - countOf0);
        avgWith = avgWith / (disciplines.length);

        avgWithout = $('<td>'+ avgWithout.toFixed(2) +'</td>');
        avgWith = $('<td>'+ avgWith.toFixed(2) +'</td>');

        $('#pupilID'+ pupils[a].id).append(
            $('<td class="paddingless"></td>').append(
                $('<table class="avrTable"><tr></tr></table>')));       
        $('#pupilID'+ pupils[a].id +' .avrTable tr').append(avgWith); 
        $('#pupilID'+ pupils[a].id +' .avrTable tr').append(avgWithout);
    }
}

function showProgress(pupilID){
    var i;
    for (i = 0; i < pupils.length; i++) 
        if (pupils[i].id == pupilID) break;
    $('#progress .modal-title #names').text(pupils[i].surname + ' ' + pupils[i].firstname + ' ' + pupils[i].middlename);

    var tabletr = $('#progress table tr'); 
    tabletr.text("");
        for (let a = 0; a < disciplines.length; a++) {
            var td = $('<td class="text-center"></td>');
            var progresbarcont = $('<div class="progresbarcont rounded"></div>');
            var progresbar = $('<div class="progresbar bg-primary rounded-top rou"></div>');
            var label = $('<small>'+disciplines[a].name+'</small>');

            var cur = $('#pupilID'+ pupilID +' #'+ disciplines[a].id).text();
            if (cur == '-')
                progresbar.css('visibility', 'hidden');
            else{
                cur = Number(cur);
                progresbar.css('height', (400*(cur/5)) + 'px');
                progresbar.css('top', (400-400*(cur/5)) + 'px');
            }
            progresbarcont.append(progresbar);
            td.append(progresbarcont);
            td.append(label);
            tabletr.append(td);
        }   
    $('#progress').modal('show');

}