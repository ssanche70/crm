var formularioAlmacen,
    table;
function agregarFilas(productos){
    for(var i=0 ; productos[i] ; i++){
        var producto = productos[i],
            nombre = producto.nombreProducto,
            codigo = producto.codigo,
            cantidad = producto.cantidadAlmacen,
            minimo = producto.minimo,
            idAlmacen = producto.idAlmacen,
            esBasico = producto.esBasico;

        getFilas(nombre, codigo, cantidad, minimo, idAlmacen, esBasico)
    }
    $('#dataTables-example').DataTable().draw();
}

function getFilas(nombre, codigo, cantidad, minimo, idAlmacen, esBasico){
    var table = $('#dataTables-example').DataTable();
    var string1,string2,string3,string4;
    string1 = '<td>' + nombre + '</td>';
    string2 = '<td>' + codigo + '</td>';
    if(cantidad > minimo){
        string3 = '<p name="' + idAlmacen + '">' + cantidad + '</p>';
    }else{
        string3 = '<p name="' + idAlmacen + '" style="color:red" title="Pocos productos">' + cantidad + '</p>';
    }
    string4 = '<form id="' + idAlmacen + '" style="display:inline" action="/almacen/' + idAlmacen + '?_method=PUT" method="POST" onsubmit="return false">';
    string4 += '<input id="' + codigo + '" type="number" name="cantidad" min="0" max="10000" value="0" class="form-control" required />';
    string4 += '<b>&nbsp &nbsp &nbsp</b>';
    string4 += '<button type="submit/image" alt="text" name="button1" onclick="return false" class="btn btn-primary btn-circle ' + idAlmacen + ' ' + codigo + ' ' + minimo + '"><i title="Agregar" class="fa fa-plus"></i></button></form>';
    if(!esBasico){
        string4 += '<b>&nbsp &nbsp &nbsp</b><button type="submit/image" alt="text" name="button2" onclick="return false" class="btn btn-danger btn-circle ' + idAlmacen + ' ' + codigo + ' ' + minimo + '"><i title="Pasar a consumo" class="fa fa-minus"></i></button>';
    }else{
        string4 += '<b>&nbsp &nbsp &nbsp</b><button type="submit/image" alt="text" name="button2" disabled="disabled" class="btn btn-danger btn-circle"><i title="Pasar a consumo" class="fa fa-minus"></i></button>';
    }
    table.row.add([
        string2,
        string1,
        string3,
        string4
    ]);
}

function eliminaFilas(){
    $('#dataTables-example').DataTable().clear().draw();
};

function activarBotones(){
    $("button[name=button1]").click(function(){
        if( confirm('¿Esta seguro que desea agregar esos productos?') ){
            var id = $(this).attr("class").split(" ")[3]
            var codigo = $(this).attr("class").split(" ")[4]
            var minimo = parseInt( $(this).attr("class").split(" ")[5] )
            var formulario = $("#"+id)
            formulario.attr("action","/almacen/"+id+"/add?_method=PUT")
            $.ajax({
                type: formulario.attr("method"),
                url:  formulario.attr("action"),
                data: formulario.serialize(),
                success:
                    function(cantidad){
                        if(cantidad !== ""){
                            var input = $("#"+codigo)
                            var p = $("p[name="+id+"]")
                            input.val("0") 
                            p.text(cantidad)
                            if( parseInt(cantidad) > minimo ) p.css("color", "#000000")
                        }
                    },
                  error: function(data){
                     alert("Error")
                  }
            })
        }
    })
    $("button[name=button2]").click(function(){
        if( confirm('¿Esta seguro que desea pasar a consumo esos productos?') ){
            var id = $(this).attr("class").split(" ")[3]
            var codigo = $(this).attr("class").split(" ")[4]
            var minimo = parseInt( $(this).attr("class").split(" ")[5] )
            var formulario = $("#"+id)
            formulario.attr("action","/almacen/"+id+"/sub?_method=PUT")

            $.ajax({
                type: formulario.attr("method"),
                url:  formulario.attr("action"),
                data: formulario.serialize(),
                success: function(cantidad){
                    if(cantidad !== ""){
                        var input = $("#"+codigo)
                        var p = $("p[name="+id+"]")
                        input.val("0") 
                        p.text(cantidad) 
                        if( parseInt(cantidad) < minimo ) p.css("color", "#FF0040")
                    }
                },
                error: function(data){
                    alert("Error")
                }
            })
        }
    })
}

function desactivarBotones(){
    $("button[name=button1]").unbind('click');
    $("button[name=button2]").unbind('click');
}

function obtenerAlmacen() {
    $.ajax({
        url: '/almacen',
        type: 'POST',
        data: formularioAlmacen.serialize(),
        success : function(data) {
            agregarFilas(data);
        }
    });
}

function reiniciarAlmacen() {
    $.ajax({
        url: '/almacen',
        type: 'POST',
        data: formularioAlmacen.serialize(),
        success : function(data) {
            eliminaFilas();
            agregarFilas(data);
        }
    });
}

$(function(){ 
    formularioAlmacen = $('#formalmacen');
    obtenerAlmacen();

    $("select[name=categoria]").change(function(){
        reiniciarAlmacen();
    });

    $('#dataTables-example').on( 'draw.dt', function () {
        desactivarBotones()
        activarBotones();
    });
    
});

    