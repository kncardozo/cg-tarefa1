(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.BasicRenderer = {}));
}(this, (function (exports) { 'use strict';


        /* ------------------------------------------------------------ */
    //Função que calcula o vetor normal entre dois pontos
    function vNormal(A, B){
        var N = nj.array([-1*(B.get(1)-A.get(1)), (B.get(0) - A.get(0))]);        
        return N;
    }    

    //Criar Bounding Box
    function createBoundingBox(primitive){
        var x_0 = 0;
        var x_1 = 0;
        var y_0 = 0;
        var y_1 = 0;   

        if(primitive.shape == "triangle" || primitive.shape== "polygon"){
            var V = primitive.vertices;
            var eixos = V.shape[1];
            var pontos = V.shape[0];
            var coord_x = nj.array();
            var coord_y = nj.array();

            var coordenadasBox = [];

            //Separa as coordenadas dos vertices em uma lista para o eixo x e y, 
            //0 representa o inicial e 1 o final
            for(var i=0;i<pontos;i++){
                for(var j=0;j<eixos;j++){
                    if(j==0){
                        coord_x = nj.concatenate(coord_x, V.get(i,j));
                    }else{
                        coord_y = nj.concatenate(coord_y, V.get(i,j));
                    } 
                }
            }

            //salvando as coordenadas da Bounding Box
            x_0 = coord_x.min();
            x_1 = coord_x.max();
            y_0 = coord_y.min();
            y_1 = coord_y.max();            
        }else{
            //calcular a bounding box do circulo
            var r = primitive.radius;
            var h = primitive.center.get(0);
            var k = primitive.center.get(1);

            //Observando que o raio do circulo é exatamente a metade do comprimento de um lado do quadrado
            //Usando o centro e o raio dado podemos estimar o vértices da box
            x_0 = h-r;
            x_1 = h+r;
            y_0 = k-r;
            y_1 = k+r;

        }
        
        coordenadasBox = {  
            x_0: x_0,
            x_1: x_1,
            y_0: y_0,
            y_1: y_1, 
        }

        return coordenadasBox;
    }

    //função de interseção. Verificar se o ponto (x,y) está dentro da primitiva
    function inside( x, y, primitive  ) {
            // You should implement your inside test here for all shapes   
            // for now, it only returns a false test                                   

            if(primitive.shape == "triangle"){
                var V = primitive.vertices;

                //Pegando as coordenadas dos pontos de cada vértice
                var P0 = nj.array([V.get(0,0),V.get(0,1)]);
                var P1 = nj.array([V.get(1,0),V.get(1,1)]);
                var P2 = nj.array([V.get(2,0),V.get(2,1)]);

                //vetores normais
                var n0 = vNormal(P0, P1);
                var n1 = vNormal(P1, P2);
                var n2 = vNormal(P2, P0);

                //Vetores até o ponto q (x,y)
                var d0 = nj.array([x - P0.get(0), y - P0.get(1) ]);
                var d1 = nj.array([x - P1.get(0), y - P1.get(1) ]);
                var d2 = nj.array([x - P2.get(0), y - P2.get(1) ]);

                //Calculo do produto interno dos vetores d e as normais 
                var L0 = (d0.get(0) * n0.get(0)) + (d0.get(1) * n0.get(1));
                var L1 = (d1.get(0) * n1.get(0)) + (d1.get(1) * n1.get(1));
                var L2 = (d2.get(0) * n2.get(0)) + (d2.get(1) * n2.get(1));

                if(L0>0 && L1>0 && L2>0){                    
                    return true;
                }
            }
            else if(primitive.shape == "circle" ){
                var r = primitive.radius;
                var h = primitive.center.get(0);
                var k = primitive.center.get(1);

                //calculo da equação implícita do circulo
                var Eq_c = ((x-h)**2) + ((y-k)**2);

                if(Eq_c == r**2 || Eq_c < r**2) return true;
                else return false;
            }
            else{
                return false;
            }
    }
        
    
    function Screen( width, height, scene ) {
        this.width = width;
        this.height = height;
        this.scene = this.preprocess(scene);   
        this.createImage(); 
    }

    Object.assign( Screen.prototype, {

            preprocess: function(scene) {                
                // Possible preprocessing with scene primitives, for now we don't change anything
                // You may define bounding boxes, convert shapes, etc
                
                var preprop_scene = [];
                
                for( var primitive of scene ) {  
                    
                    if(primitive.shape == "polygon" ){
                        //Converter Poligonos em triangulos
                        //n-3 diagonais | n-2 triangulos
                        var V = primitive.vertices;
                        var pontos = V.shape[0]; //Quantidade de pontos
                        //var scene_triangulos = [];//primitiva triangulo
                       
                        //Fixar um ponto
                        var P0 = nj.array([V.get(0,0),V.get(0,1)]);
        
                        for(var k=1; k < pontos-1 ; k++){
                            
                            var triangulo = {
                                shape:"triangle",
                                vertices: nj.array([
                                    [P0.get(0), P0.get(1)],
                                    [V.get(k,0), V.get(k,1)],
                                    [V.get(k+1,0), V.get(k+1,1)]
                                ]),
                                color: primitive.color,   
                            };
                            var boundingBox = createBoundingBox(triangulo);
                            preprop_scene.push( boundingBox );
                            preprop_scene.push(triangulo);                            
                            
                        }                     
                        
                    }else{
                        var boundingBox = createBoundingBox(primitive);
                        // do some processing
                        // for now, only copies each primitive to a new list                 
                    
                        preprop_scene.push( boundingBox );
                        preprop_scene.push( primitive );   
                          
                    }                    
                                  
                }

                return preprop_scene;
            },

            createImage: function() {
                this.image = nj.ones([this.height, this.width, 3]).multiply(255);
            },

            rasterize: function() {
                var color;
                
                for(var k=0;k<this.scene.length;k=k+2){
                    var bbox = this.scene[k];
                    console.log(bbox);//Debug bounding box
                    var primitive = this.scene[k+1];
              
                    for (var i = bbox.x_0; i <= bbox.x_1; i++) {
                        var x = i + 0.5;
                        console.log("Entrei");  
                        for( var j = bbox.y_0; j <= bbox.y_1; j++) {
                            var y = j + 0.5;                            
                              
                            if ( inside( x, y, primitive ) ) {                                
                                color = primitive.color;
                                this.set_pixel( i, this.height - (j + 1), color );
                            }
                            
                        }
                    }                 
                }              
            },

            set_pixel: function( i, j, colorarr ) {
                // We assume that every shape has solid color
         
                this.image.set(j, i, 0, colorarr.get(0));
                this.image.set(j, i, 1, colorarr.get(1));
                this.image.set(j, i, 2, colorarr.get(2));
            },

            update: function () {
                // Loading HTML element
                var $image = document.getElementById('raster_image');
                $image.width = this.width; $image.height = this.height;

                // Saving the image
                nj.images.save( this.image, $image );
            }
        }
    );

    exports.Screen = Screen;
    
})));

