(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.BasicRenderer = {}));
}(this, (function (exports) { 'use strict';


        /* ------------------------------------------------------------ */
    function vNormal(A, B){
        var N = nj.array([-1*(B.get(1)-A.get(1)), (B.get(0) - A.get(0))]);        
        return N;
    }

    //função de interseção. Verificar se o ponto (x,y) está dentro da primitiva
    function inside( x, y, primitive  ) {
            // You should implement your inside test here for all shapes   
            // for now, it only returns a false test                                   

            if(primitive.shape == "triangle"){
                var V = primitive.vertices;

                //usar o cálculo do produto interno para verificar se os pontos estão na primitiva
                var P0 = nj.array([V.get(0,0),V.get(0,1)]);
                var P1 = nj.array([V.get(1,0),V.get(1,1)]);
                var P2 = nj.array([V.get(2,0),V.get(2,1)]);

                //vetores normais
                var n0 = vNormal(P0, P1);
                var n1 = vNormal(P1, P2);
                var n2 = vNormal(P2, P0);

                //Vetores até o ponto q
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
            }else if(primitive.shape == "circle" ){
                var r = primitive.radius;
                var h = primitive.center.get(0);
                var k = primitive.center.get(1);

                //calculo da equação implícita do circulo
                var Eq_c = ((x-h)**2) + ((y-k)**2);

                if(Eq_c == r**2 || Eq_c < r**2) return true;
                else return false;
            }else{
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
                    // do some processing
                    // for now, only copies each primitive to a new list

                    preprop_scene.push( primitive );
                    
                }

                
                return preprop_scene;
            },

            createImage: function() {
                this.image = nj.ones([this.height, this.width, 3]).multiply(255);
            },

            rasterize: function() {
                var color;
         
                // In this loop, the image attribute must be updated after the rasterization procedure.
                for( var primitive of this.scene ) {

                    // Loop through all pixels
                    for (var i = 0; i < this.width; i++) {
                        var x = i + 0.5;
                        for( var j = 0; j < this.height; j++) {
                            var y = j + 0.5;

                            // First, we check if the pixel center is inside the primitive 
                            if ( inside( x, y, primitive ) ) {
                                // only solid colors for now
                                color = primitive.color;
                                this.set_pixel( i, this.height - (j + 1), color );
                            }
                            
                        }
                    }
                }
                
               
              
            },

            set_pixel: function( i, j, colorarr ) {
                // We assume that every shape has solid color
         
                this.image.set(j, i, 0,    colorarr.get(0));
                this.image.set(j, i, 1,    colorarr.get(1));
                this.image.set(j, i, 2,    colorarr.get(2));
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

