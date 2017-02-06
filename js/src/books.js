$(function () {
	$.getJSON("/books/books.json", function (books) {
		
        getTemplate('book', books).done(function(data){
            // console.log(data);
            $('.books').append(data);
        })
    });
});

function getTemplate(name, data){
    var d=$.Deferred();

    $.get('/books/'+name+'.txt', function(response){
        var template = Handlebars.compile(response);
        d.resolve(template(data))
    });

    return d.promise();
}