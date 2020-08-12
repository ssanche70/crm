var formularioAlmacen;
function agregarFilas(productos){
    for(var i=0 ; productos[i] ; i++){
        var producto = productos[i],
            nombre = producto.nombreProducto,
            codigo = producto.codigo,
            cantidad = producto.cantidadAlmacen,
            minimo = producto.minimo;

        getFilas(nombre, codigo, cantidad, minimo)
    }
    $('#dataTables-example').DataTable().draw();
}

function getFilas(nombre, codigo, cantidad, minimo){
    var table = $('#dataTables-example').DataTable();
    var string1,string2,string3,string4;
    
    string1 = '<td>' + nombre + '</td>';
    string2 = '<td>' + codigo + '</td>';
    if(cantidad > minimo){
        string3 = '<p>' + cantidad + '</p>';
    }else{
        string3 = '<p style="color:red" title="Pocos productos">' + cantidad + '</p>';
    }
     
    table.row.add([
        string2,
        string1,
        string3
    ]);
}
function eliminaFilas(){
    $('#dataTables-example').DataTable().clear().draw();
};

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

    $("select[name=plaza]").change(function(){
        reiniciarAlmacen();
    });
    
    $("select[name=categoria]").change(function(){
        reiniciarAlmacen();
    });
});
    